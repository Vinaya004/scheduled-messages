
import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt, FaPaperPlane, FaSmile } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import './Input.css';

const Input = ({ message, setMessage, sendMessage, scheduleTime, setScheduleTime }) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isDatePickerOpen, setDatePickerOpen] = useState(false);
    const emojiPickerRef = useRef(null);

    const handleIconClick = () => {
        setDatePickerOpen(!isDatePickerOpen);
    };

    const onEmojiClick = (emojiObject) => {
        setMessage((prevMessage) => prevMessage + emojiObject.emoji);
        setShowEmojiPicker(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [emojiPickerRef]);

    return (
        <form className='form' onSubmit={sendMessage}>
            <input
                className='input'
                type='text'
                placeholder="Type a message..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
            />
            <button className='sendButton' type='submit'><FaPaperPlane /></button>
            <div className='datePickerContainer'>
                <FaCalendarAlt className='dateIcon' onClick={handleIconClick} />
                {isDatePickerOpen && (
                    <DatePicker
                        selected={scheduleTime}
                        onChange={(date) => setScheduleTime(date)}
                        showTimeSelect
                        timeIntervals={1} // Allows selecting every minute
                        dateFormat="Pp"
                        withPortal // Displays calendar in a portal
                    />
                )}
            </div>
            <FaSmile className="emojiIcon" onClick={() => setShowEmojiPicker(!showEmojiPicker)} />
            {showEmojiPicker && (
                <div className="emojiPickerContainer" ref={emojiPickerRef}>
                    <EmojiPicker onEmojiClick={onEmojiClick} />
                </div>
            )}
        </form>
    );
};

export default Input;
