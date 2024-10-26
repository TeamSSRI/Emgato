import React from 'react';
import styles from './GameMenu.module.css'; // Import the CSS module correctly

const GameMenu = () => {
    return (
        <div className={styles.menuContainer}>
            {/* Title */}
            <div className={styles.title}>
                <h1>EMGATO</h1>
            </div>

            {/* Main buttons */}
            <div className={styles.mainButtons}>
            <a href="/mapmenu" className={styles.button}>
          MAP 📜
        </a>
                <button className={styles.button}>START 🐾</button>
                <button className={styles.button}>LEADERBOARD 🏆</button>
            </div>

            {/* Settings Icons */}
            <div className={styles.settingsIcons}>
                <div className={styles.icon}>⚙️</div>
                <div className={styles.icon}>👤</div>
                <div className={styles.icon}>🔊</div>
                <div className={styles.icon}>🎵</div>
            </div>

            {/* Cat illustration placeholder */}
            <div className={styles.catPlaceholder}></div>
        </div>
    );
};

export default GameMenu;
