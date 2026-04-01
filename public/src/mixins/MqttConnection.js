/* eslint-disable */
import Paho from 'paho-mqtt';

export default {

  connect(data, onConnectCallback) {

    const brokerUrl = "wss://" +
      data.user.mqtt_web_configure.host +
      ":" +
      data.user.mqtt_web_configure.port +
      "/mqtt";

    const clientId = data.user.mqtt_web_configure.client_id;
    const username = data.user.mqtt_web_configure.user_name;
    const password = data.user.mqtt_web_configure.password;

    const client = new Paho.Client(brokerUrl, clientId);

    // client.onConnectionLost = this.onConnectionLost;
    // client.onMessageArrived = this.onMessageArrived;

    const connectOptions = {
      onSuccess: onConnectCallback,
      userName: username,
      password: password,
      useSSL: false,
      // Set to true if your broker uses SSL
    };


    client.connect(connectOptions);
    // client.subscribe('mohankumar@mobil80.com~radhika@mobil80.com')
    return client;
  },

  //   onConnectionLost(responseObject) {

  //     if (responseObject.errorCode !== 0) {
  //         console.log('Connection lost:', responseObject);
  //     }
  //   },

  //   onMessageArrived(message) {

  //     const existingMessages = JSON.parse(localStorage.getItem('receivedMessages')) || [];
  //     existingMessages.push(message.payloadString);
  //     localStorage.setItem('receivedMessages', JSON.stringify(existingMessages));
  //     console.log('Message received:', message.payloadString);

  //   },
};