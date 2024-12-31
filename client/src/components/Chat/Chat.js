import React, { useEffect, useState } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';
import { useLocation } from 'react-router-dom';
import Infobar from '../Infobar/Infobar';
import Input from '../Input/Input';
import Messages from '../Messages/Messages';
import TextContainer from '../TextContainer/TextContainer';
import './Chat.css';

let socket;

const Chat = () => {
    const location = useLocation();
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [scheduledMessages, setScheduledMessages] = useState([]);
    const [scheduleTime, setScheduleTime] = useState(null);
    const ENDPOINT = 'http://localhost:5000';

    useEffect(() => {
        const { name, room } = queryString.parse(location.search);
        socket = io(ENDPOINT);
        setName(name);
        setRoom(room);

        socket.emit('join', { name, room }, (error) => {
            if (error) {
                alert(error);
            }
        });

        socket.on('message', (message) => {
            // Add messages regardless of sender
            if(message.user!==name){
            setMessages((prevMessages) => [...prevMessages, message]);}
        });

        socket.on("roomData", ({ users }) => {
            setUsers(users);
        });

        return () => {
            socket.disconnect();
            socket.off();
        };
    }, [ENDPOINT, location.search]);

    const sendMessage = (event) => {
        event.preventDefault();
        if (message) {
            const currentTime = new Date();
            const scheduledTime = new Date(scheduleTime);
    
            if (scheduledTime && scheduledTime > currentTime) {
                const timeDiff = scheduledTime - currentTime;
    
                // Store the message as scheduled
                setScheduledMessages((prev) => [...prev, { text: message, time: scheduledTime }]);
    
                // Set a timeout to send the message at the scheduled time
                setTimeout(() => {
                    const msgToSend = { text: message, user: name, time: new Date() };
                    socket.emit('sendMessage', msgToSend, () => {
                        setMessages((prev) => [...prev, msgToSend]); // Add to messages
                    });
                    // Remove the message from the scheduled messages
                    setScheduledMessages((prev) => prev.filter((msg) => msg.time !== scheduledTime));
                }, timeDiff);
            } else {
                const msgToSend = { text: message, user: name, time: new Date() };
                socket.emit('sendMessage', msgToSend, () => {
                    setMessages((prev) => [...prev, msgToSend]); // Add to messages
                });
            }
    
            // Reset input and schedule time after sending
            setMessage('');
            setScheduleTime(null);
        }
    };
    

    return (
        <div className='outerContainer'>
            <div className='container'>
                {/* <TextContainer/> */}
                <Infobar room={room} />
                <div className="scheduledMessages">
                    <select className="dropdown" defaultValue="">
                        <option value="" disabled>Scheduled Messages</option>
                        {scheduledMessages.map((msg, index) => (
                            <option key={index}>
                                {`${msg.time.toLocaleString()}: ${msg.text}`}
                            </option>
                        ))}
                    </select>
                </div>
                <Messages messages={messages} name={name} />
                <Input 
                    message={message} 
                    setMessage={setMessage} 
                    sendMessage={sendMessage} 
                    scheduleTime={scheduleTime} 
                    setScheduleTime={setScheduleTime} 
                />
            </div>
            <TextContainer users={users} />
        </div>
    );
};

export default Chat;
