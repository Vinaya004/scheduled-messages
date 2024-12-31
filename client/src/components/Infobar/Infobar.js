import React from 'react';
import closeIcon from '../../Icons/closeIcon.png';
import onlineIcon from '../../Icons/onlineIcon.png';
import './Infobar.css';

const Infobar=({room})=>(
<div className='infoBar'>
    <div className='leftInnerContainer'>
        <img className='onlineIcon' src={onlineIcon} />
        <h3>{room}</h3>
    </div>
    <div className='rightInnerContainer'>
        <a href='/'><img src={closeIcon} alt="close image"/></a>
    </div>
</div>

)

export default Infobar;