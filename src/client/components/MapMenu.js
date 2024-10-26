import React, { Component } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import styles from './MapMenu.module.css'; // Import CSS module for styling

class MapMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userLocation: null,
      errorMessage: '',
    };
  }

  componentDidMount() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.setState({
            userLocation: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          });
        },
        (error) => {
          console.error('Error fetching user location:', error);
          this.setState({
            errorMessage: 'Failed to get your location. Loading default...',
            userLocation: { lat: 32.9857, lng: -96.7502 }, // Fallback to UTD
          });
        }
      );
    } else {
      this.setState({
        errorMessage: 'Geolocation not supported. Loading default...',
        userLocation: { lat: 32.9857, lng: -96.7502 },
      });
    }
  }

  render() {
    const { userLocation, errorMessage } = this.state;

    const mapContainerStyle = {
      width: '100%',
      height: '400px',
    };

    return (
      <div className={styles.mapMenuContainer}>
        {/* Home Button as a link to GameMenu */}
        <div className={styles.homeButton}>
          <a href="/gamemenu" className={styles.homeLink}>
            <button className={styles.homeIcon}>🏠</button>
          </a>
          <span className={styles.homeText}>Home</span>
        </div>

        {/* Map Title */}
        <div className={styles.mapTitle}>
          <h1>MAP</h1>
        </div>

        {/* Display error message if any */}
        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

        {/* Google Map */}
        <div className={styles.mapContainer}>
          <LoadScript googleMapsApiKey="AIzaSyA8clcjZ2h9qrFLnDuM0Xd4lrUzLnntvqk">
            {userLocation && userLocation.lat && userLocation.lng ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={userLocation}
                zoom={16}
              >
                <Marker position={userLocation} label="🐾" />
              </GoogleMap>
            ) : (
              <p>Loading map...</p>
            )}
          </LoadScript>
        </div>

        {/* Left Panel - New Level and You Are Here */}
        <div className={styles.leftPanel}>
          <div className={styles.panelItem}>
            <div className={styles.iconBox}>📦</div>
            <span className={styles.panelText}>New level</span>
          </div>
          <div className={styles.panelItem}>
            <div className={styles.iconBox}>🐾</div>
            <span className={styles.panelText}>You are here</span>
          </div>
        </div>

        {/* Right Panel - Events and Levels */}
        <div className={styles.rightPanel}>
          <div className={styles.events}>
            <h2>Events:</h2>
            <p>- None right now, please check back later</p>
          </div>
          <div className={styles.levels}>
            <h2>Levels:</h2>
            <p>- Plinth</p>
          </div>
        </div>
      </div>
    );
  }
}

export default MapMenu;
