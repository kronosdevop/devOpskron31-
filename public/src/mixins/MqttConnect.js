/* eslint-disable */
import mqtt from "mqtt";
import { openDB } from "idb";
import { initiateLocalCacheDB } from "@/db.js";
import { EventBus } from "@/main";
import { notifyListeners } from "@/Eventbus.js"; // 
import store from "@/store";
import { Buffer } from "buffer";
import { Auth } from "aws-amplify";
export const connecttoMQTTMethod = {
    mixins: [initiateLocalCacheDB],
    data: () => ({
        client: null,
        messagedata: [],
        uniqueCounter: 0,
        notificationsData: [],
        channelData: [],
        options: {
            qos: 1 // Set QoS level (0, 1, or 5)
        },

    }),
    methods: {
        async deleteCategoryFromStore(categoryId) {
            const db = await openDB("STICHH_LOCALDATABASE", 7);
            const store = db
                .transaction("STORE_CHAT_LIST", "readwrite")
                .objectStore("STORE_CHAT_LIST");
            await store.delete(categoryId);
            // console.log(`Category with ID ${categoryId} deleted from store.`);
        },
        async deleteMessageFromStore(categoryId) {
            const db = await openDB("STICHH_LOCALDATABASE", 7);
            const store = db
                .transaction("STORE_CHAT_MESSAGE", "readwrite")
                .objectStore("STORE_CHAT_MESSAGE");
            await store.delete(categoryId);
            // console.log(`Category with ID ${categoryId} deleted from store.`);
        },
        async updateMessage(newObject) {

            const topic = newObject.topic;
            const existingTopic = this.messagedata.find(item => item.topic === topic);
            if (existingTopic) {

                existingTopic.data.push(newObject.data);
            } else {
                // If the topic doesn't exist, create a new object with the topic and data
                this.messagedata.push({ topic: topic, data: [newObject.data] });
            }
            const StoredCategories = await this.getResourcesMessage();
            for (let i = 0; i < this.messagedata.length; i++) {
                const groups = this.messagedata[i];
                const categoryExist = StoredCategories.find(
                    (c) => c.topic === groups.topic
                );
                if (categoryExist) {
                    const isUpdated = this.compareMessages(
                        categoryExist,
                        groups
                    );
                    if (isUpdated) {
                        await this.updateMessageToStore(groups);
                    }
                } else {
                    await this.addMessageToStore(groups);
                }
            }
            for (let i = 0; i < StoredCategories.length; i++) {
                const storedCategory = StoredCategories[i];
                const categoryExist = this.messagedata.find(
                    (c) => c.topic === storedCategory.topic
                );
                if (!categoryExist) {
                    await this.deleteMessageFromStore(storedCategory.topic);
                }
            }




            // Loop through the people array and check for '~' in the topic
            this.messagedata.forEach(messagetopic => {

                if (messagetopic.topic.includes(this.$store.getters.GetUserObj.user.user_email_id)) {
                    let emails = messagetopic.topic.split('~');
                    let teamName;
                    // Check which part matches current_email and return the other part
                    if (emails[0] === this.$store.getters.GetUserObj.user.user_email_id) {
                        teamName = emails[1];
                        // If current_email is the first, return the second
                    } else if (emails[1] === this.$store.getters.GetUserObj.user.user_email_id) {
                        teamName = emails[0];
                        // If current_email is the second, return the first
                    } else {
                        teamName = this.$store.getters.GetUserObj.user.user_email_id

                    }

                    const exists = this.chatList.some(obj => obj.team_name === teamName);
                    if (!exists) {
                        const transformedObject = {
                            team_type: 'ONE_ON_ONE_MESSAGE',
                            team_topic_id: messagetopic.topic,
                            // team_id: team_${Date.now()}_${this.uniqueCounter++}, 
                            team_id: teamName,
                            // Generating a unique ID based on current timestamp
                            team_name: teamName  // Add the team_name from the part before '~'
                        };

                        this.chatList.push(transformedObject);
                    }
                }
            });
            this.chatList.forEach((chatdata) => {
                const user = this.messagedata.find(
                    (user) => user.topic === chatdata.team_topic_id
                );

                if (user) {
                    const lastmessagedata = user.data[user.data.length - 1];
                    chatdata.previous_sent_message =
                        chatdata.last_message_on == undefined
                            ? lastmessagedata.msg_created_on
                            : chatdata.last_message_on;
                    chatdata.last_message_on = lastmessagedata.msg_created_on;
                    chatdata.previous_message = lastmessagedata.msg_payload;
                    chatdata.msg_type = lastmessagedata.msg_type;


                    if (chatdata.newMessageCount == undefined) {
                        chatdata.newMessageCount = 0;
                        if (chatdata.last_message_on != chatdata.previous_sent_message) {
                            chatdata.newMessageCount++;


                        }
                    } else {
                        if (chatdata.last_message_on != chatdata.previous_sent_message) {

                            chatdata.newMessageCount++;



                        }
                    }
                }
            });
            this.chatList.sort((a, b) => {
                const aLastMessageDate = a.last_message_on
                    ? new Date(a.last_message_on)
                    : new Date(a.team_created_on);
                const bLastMessageDate = b.last_message_on
                    ? new Date(b.last_message_on)
                    : new Date(b.team_created_on);

                return bLastMessageDate - aLastMessageDate;
            });
            // console.log(this.messagedata, 'this.messagedata')
            this.channelData.forEach((chatdata) => {
                const user = this.messagedata.find(
                    (user) => user.topic === chatdata.team_topic_id
                );

                if (user) {
                    const lastmessagedata = user.data[user.data.length - 1];

                    chatdata.previous_sent_message =
                        chatdata.last_message_on == undefined
                            ? lastmessagedata.msg_created_on
                            : chatdata.last_message_on;
                    chatdata.last_message_on = lastmessagedata.msg_created_on;
                    chatdata.previous_message = lastmessagedata.msg_title;
                    chatdata.msg_type = lastmessagedata.msg_type;

                    if (chatdata.newMessageCount == undefined) {
                        chatdata.newMessageCount = 0;
                        if (chatdata.last_message_on != chatdata.previous_sent_message) {
                            chatdata.newMessageCount++;
                        }
                    } else {
                        if (chatdata.last_message_on != chatdata.previous_sent_message) {

                            chatdata.newMessageCount++;

                        }
                    }
                }
            });
            this.channelData.sort((a, b) => {
                const aLastMessageDate = a.last_message_on
                    ? new Date(a.last_message_on)
                    : new Date(a.team_created_on);
                const bLastMessageDate = b.last_message_on
                    ? new Date(b.last_message_on)
                    : new Date(b.team_created_on);

                return bLastMessageDate - aLastMessageDate;
            });

            return this.channelData;
        },


        async getResourcesMessage() {
            try {
                const db = await openDB("STICHH_LOCALDATABASE", 7);
                if (!db.objectStoreNames.contains("STORE_CHAT_MESSAGE")) {
                    console.warn("STORE_CHAT_MESSAGE does not exist, returning empty array");
                    return [];
                }
                const store = db
                    .transaction("STORE_CHAT_MESSAGE")
                    .objectStore("STORE_CHAT_MESSAGE");
                const allResources = await store.getAll();
                return allResources || [];
            } catch (error) {
                console.error("Error getting chat messages:", error);
                return [];
            }
        },
        compareMessages(category_exist, new_category) {
            // console.log(category_exist, new_category)
            const storedKeys = Object.keys(category_exist);
            const newKeys = Object.keys(new_category);

            if (storedKeys.length !== newKeys.length) {
                return true;
            }
            for (let key of storedKeys) {
                if (
                    JSON.stringify(category_exist[key]) !==
                    JSON.stringify(new_category[key])
                ) {
                    return true;
                }
            }
            return false;
        },
        async updateMessageToStore(categories) {
            const db = await openDB("STICHH_LOCALDATABASE", 7);
            const store = db
                .transaction("STORE_CHAT_MESSAGE", "readwrite")
                .objectStore("STORE_CHAT_MESSAGE");

            await store.put(JSON.parse(JSON.stringify(categories)));
        },
        async updateNotifications(notifications) {
            const db = await openDB("STICHH_LOCALDATABASE", 7);
            const store = db
                .transaction("STORE_NOTIFICATIONS_LIST", "readwrite")
                .objectStore("STORE_NOTIFICATIONS_LIST");

            await store.put(JSON.parse(JSON.stringify(notifications)));
        },
        // async addNotificaitions(categories) {
        //     console.log('add', categories);

        //     if (!categories || typeof categories !== "object") {
        //         console.error("Invalid data format", categories);
        //         return;
        //     }
        //     if (!categories.msg_id) {
        //         console.error("msg_id is missing or invalid", categories);
        //         return;
        //     }

        //     const db = await openDB("STICHH_LOCALDATABASE", 5);
        //     const store = db
        //         .transaction("STORE_NOTIFICATIONS_LIST", "readwrite")
        //         .objectStore("STORE_NOTIFICATIONS_LIST");

        //     const cleanCategories = JSON.parse(JSON.stringify(categories));

        //     try {
        //         const existingItem = await store.get(cleanCategories.msg_id);
        //         if (!existingItem) {
        //             await store.put(cleanCategories); // Use `put()` instead of `add()`
        //         }
        //     } catch (error) {
        //         console.error("Error adding to IndexedDB:", error);
        //     }
        // },

        async addNotificaitions(categories) {

            const db = await openDB("STICHH_LOCALDATABASE", 7);
            const store = db
                .transaction("STORE_NOTIFICATIONS_LIST", "readwrite")
                .objectStore("STORE_NOTIFICATIONS_LIST");
            // const cleanCategories = JSON.parse(JSON.stringify(categories));
            const existingItem = await store.get(categories.msg_id);
            if (!existingItem) {
                // console.log('hgggg', JSON.parse(JSON.stringify(categories)))
                // console.log('dd', categories)
                // notifyListeners(JSON.parse(JSON.stringify(categories)));

                await store.add(JSON.parse(JSON.stringify(categories)));

            }
        },
        async addMessageToStore(categories) {
            const db = await openDB("STICHH_LOCALDATABASE", 7);
            const store = db
                .transaction("STORE_CHAT_MESSAGE", "readwrite")
                .objectStore("STORE_CHAT_MESSAGE");
            const existingItem = await store.get(categories.topic);
            if (!existingItem) {

                await store.add(JSON.parse(JSON.stringify(categories)));
            }
        },

        async getResourcesFromCategories() {
            try {
                const db = await openDB("STICHH_LOCALDATABASE", 7);
                if (!db.objectStoreNames.contains("STORE_CHAT_LIST")) {
                    console.warn("STORE_CHAT_LIST does not exist, returning empty array");
                    return [];
                }
                const store = db
                    .transaction("STORE_CHAT_LIST")
                    .objectStore("STORE_CHAT_LIST");
                const allResources = await store.getAll();
                return allResources || [];
            } catch (error) {
                console.error("Error getting chat categories:", error);
                return [];
            }
        },

        async updateCategoryToStore(categories) {
            const db = await openDB("STICHH_LOCALDATABASE", 7);
            const store = db
                .transaction("STORE_CHAT_LIST", "readwrite")
                .objectStore("STORE_CHAT_LIST");

            await store.put(JSON.parse(JSON.stringify(categories)));
        },
        compareResources(category_exist, new_category) {
            const storedKeys = Object.keys(category_exist);
            const newKeys = Object.keys(new_category);

            if (storedKeys.length !== newKeys.length) {
                return true;
            }
            for (let key of storedKeys) {
                if (
                    JSON.stringify(category_exist[key]) !==
                    JSON.stringify(new_category[key])
                ) {
                    return true;
                }
            }
            return false;
        },
        async addCategoryToStore(categories) {
            const db = await openDB("STICHH_LOCALDATABASE", 7);
            const store = db
                .transaction("STORE_CHAT_LIST", "readwrite")
                .objectStore("STORE_CHAT_LIST");
            const existingItem = await store.get(categories.team_id);
            if (!existingItem) {
                await store.add(JSON.parse(JSON.stringify(categories)));
            }
        },
        async connecttoMQTTMethod(url, username, password, topic) {


            // Validate input parameters
            if (!url || typeof url !== "string") {
                // console.error("Invalid URL. Please provide a valid WebSocket URL.");
                return;
            }

            // Ensure the protocol is WebSocket (`ws://` or `wss://`)
            if (!url.startsWith("ws://") && !url.startsWith("wss://")) {
                console.error("URL must start with 'ws://' or 'wss://'");
                return;
            }
            let clinetIDInfo = this.$store.getters.GetUserObj;
            // Configure MQTT client options
            const options = {
                clientId: clinetIDInfo.user.mqtt_web_configure.client_id,
                // clientId:"darshan",
                // clientId: `web-client-${Math.random().toString(16).substr(5, 8)}`,
                username: username || undefined, // Optional: provide username if required
                password: password || undefined, // Optional: provide password if required
                clean: true, // Use a clean session
                reconnectPeriod: 5000, // Retry connection every 5 seconds
                connectTimeout: 30 * 1000, // Connection timeout: 30 seconds
            };

            // console.log("Connecting to MQTT broker at:", url, options);

            // Connect to the MQTT broker
            this.client = mqtt.connect(url, options);

            // Event: On successful connection
            this.client.on("connect", () => {
                this.$store.commit("SetmqqtColor", "green")
                // console.log("Connected to MQTT broker!");
                // if (Array.isArray(topics) && topics.length > 0) {
                //     topics.forEach(topic => {
                //         this.subscribeToTopicMethod(topic);
                //     });
                // } else {
                //     console.error("No topics provided to subscribe to.");
                // }
                this.subscribeToTopicMethod(topic)

            });


            // Event: On receiving a message
            this.client.on("message", async (topic, message) => {
                this.$store.commit("SetmqqtColor", "green")
                // console.log("Check message", message);
                const decoder = Buffer.from(message); // assuming it's UTF-8 encoded
                const decodedString = decoder.toString('utf-8');

                // console.log(JSON.parse(decodedString), 'decodedString');
                // let incomingmessage = message.toString()
                // console.log("incoming message", incomingmessage)
                // const jsonObject = JSON.parse(incomingmessage);
                const jsonObject = JSON.parse(decodedString);
                // console.log(jsonObject)
                if (jsonObject.message_type == 'LOGOUT_MESSAGE') {
                    this.disconnectmqqt();
                    this.signing_out(jsonObject.data.msg_sent_by);
                }
                if (jsonObject.message_type == "APPSLIST") {
                    store.dispatch("receiveMessage", jsonObject);
                }
                if (jsonObject.message_type == "NOTIFICATION_MESSAGE") {
                    this.notificationsData = await this.getAllItems("STORE_NOTIFICATIONS_LIST");

                    var notifications = {
                        // data: jsonObject,
                        message_type: jsonObject.message_type,
                        msg_created_on: jsonObject.data.msg_created_on,
                        msg_description: jsonObject.data.msg_description,
                        msg_id: jsonObject.data.msg_id,
                        msg_sent_by: jsonObject.data.msg_sent_by,
                        msg_title: jsonObject.data.msg_title,
                        msg_topic: jsonObject.data.msg_topic,
                        msg_type: jsonObject.data.msg_type,
                        cureentUser: clinetIDInfo.user.user_email_id

                    }
                    // console.log('latejsgd', this.notificationsData)
                    this.notificationsData.push(notifications)

                    const recentNotification = await this.fetch_local_notification()

                    for (let i = 0; i < this.notificationsData.length; i++) {
                        const notify = this.notificationsData[i];

                        const categoryExist = recentNotification.find(
                            (c) => c.msg_id === notify.msg_id
                        );
                        if (categoryExist) {
                            const isUpdated = this.compareMessages(
                                categoryExist,
                                notify
                            );
                            if (isUpdated) {
                                await this.updateNotifications(notify);
                            }
                        } else {
                            await this.addNotificaitions(notify);

                        }
                    }

                    // for (let i = 0; i < recentNotification.length; i++) {
                    //     const storedCategory = recentNotification[i];
                    //     const categoryExist = this.notificationsData.find(
                    //         (c) => c.msg_id === storedCategory.msg_id
                    //     );
                    //     if (!categoryExist) {
                    //         await this.deleteMessageFromStore(storedCategory.topic);
                    //     }
                    // }

                    // store.dispatch("receiveMessage", jsonObject);

                }

                if (jsonObject.message_type == "TASK") {
                    store.dispatch("receiveMessage", jsonObject);
                }
                if (jsonObject.message_type == "PENDINGWORKFLOW") {
                    store.dispatch("receiveMessage", jsonObject);
                }

                if (jsonObject.message_type == 'RESTRICTEDCHANNELS') {
                    jsonObject.data.forEach(element => {
                        this.subscribeToTopicMethod(element.team_topic_id)

                    });
                    //channels
                    this.channelData = this.channelData.concat(jsonObject.data)
                }
                if (jsonObject.message_type == 'OPENCHANNELS') {

                    jsonObject.data.forEach(element => {
                        this.subscribeToTopicMethod(element.team_topic_id)

                    });
                    //channels
                    this.channelData = this.channelData.concat(jsonObject.data);
                }
                if (jsonObject.message_type == 'BROADCAST_MESSAGE') {
                    store.dispatch("receiveMessage", jsonObject);
                    //channels
                    this.messagedata = await this.getAllItems("STORE_CHAT_MESSAGE");
                    this.updateMessage(jsonObject);
                }



                if (jsonObject.message_type == 'RESTRICTEDGROUPCHATS') {
                    const StoredCategories = await this.getResourcesFromCategories();
                    for (let i = 0; i < jsonObject.data.length; i++) {
                        const groups = jsonObject.data[i];
                        const categoryExist = StoredCategories.find(
                            (c) => c.team_id === groups.team_id
                        );
                        if (categoryExist) {
                            const isUpdated = this.compareResources(
                                categoryExist,
                                groups
                            );
                            if (isUpdated) {
                                await this.updateCategoryToStore(groups);
                            }
                        } else {
                            await this.addCategoryToStore(groups);
                        }
                    }
                    for (let i = 0; i < StoredCategories.length; i++) {
                        const storedCategory = StoredCategories[i];
                        const categoryExist = jsonObject.data.find(
                            (c) => c.team_id === storedCategory.team_id
                        );
                        if (!categoryExist) {
                            await this.deleteCategoryFromStore(storedCategory.team_id);
                        }
                    }
                    let updatedChatList = await this.getAllItems("STORE_CHAT_LIST");
                    for (let i = 0; i < updatedChatList.length; i++) {
                        this.subscribeToTopicMethod(updatedChatList[i].team_topic_id)

                    }
                    this.messagedata = await this.getAllItems("STORE_CHAT_MESSAGE");

                    this.chatList = updatedChatList;
                    if (this.messagedata) {
                        this.messagedata.forEach(messagetopic => {

                            if (messagetopic.topic.includes(this.$store.getters.GetUserObj.user.user_email_id)) {
                                let emails = messagetopic.topic.split('~');
                                let teamName;
                                // Check which part matches current_email and return the other part
                                if (emails[0] === this.$store.getters.GetUserObj.user.user_email_id) {
                                    teamName = emails[1];
                                    // If current_email is the first, return the second
                                } else if (emails[1] === this.$store.getters.GetUserObj.user.user_email_id) {
                                    teamName = emails[0];
                                    // If current_email is the second, return the first
                                } else {
                                    teamName = this.$store.getters.GetUserObj.user.user_email_id

                                }

                                const exists = this.chatList.some(obj => obj.team_name === teamName);
                                if (!exists) {
                                    const transformedObject = {
                                        team_type: 'ONE_ON_ONE_MESSAGE',
                                        team_topic_id: messagetopic.topic,
                                        // team_id: team_${Date.now()}_${this.uniqueCounter++}, 
                                        team_id: teamName,
                                        // Generating a unique ID based on current timestamp
                                        team_name: teamName  // Add the team_name from the part before '~'
                                    };

                                    this.chatList.push(transformedObject);
                                }
                            }
                        });
                    }
                }


                if (jsonObject.message_type == 'ONE_ON_ONE_MESSAGE') {
                    store.dispatch("receiveMessage", jsonObject);
                    this.messagedata = await this.getAllItems("STORE_CHAT_MESSAGE");
                    this.updateMessage(jsonObject);

                }
                if (jsonObject.message_type == 'CHAT_MESSAGE') {
                    store.dispatch("receiveMessage", jsonObject);
                    this.messagedata = await this.getAllItems("STORE_CHAT_MESSAGE");
                    this.updateMessage(jsonObject)
                }


                // this.chatList = await this.getAllItems("STORE_CHAT_LIST");
                // this.$store.commit("SET_DASHBOARD_DETAILS", jsonObject);
                // this.$router.push("/ImageDashboard")

            });

            // Event: On connection error
            this.client.on("error", (err) => {
                this.$store.commit("SetmqqtColor", "red")
                console.error("Connection error:", err);
            });

            // Event: On connection close
            this.client.on("close", () => {
                this.$store.commit("SetmqqtColor", "red")
                // console.log("Connection closed");
            });

            // Event: On reconnect
            this.client.on("reconnect", () => {
                this.$store.commit("SetmqqtColor", "red")
                // console.log("Reconnecting to MQTT broker...");
            });

            // Event: On offline
            this.client.on("offline", () => {
                this.$store.commit("SetmqqtColor", "red")
                this.disconnectmqqt();
                console.error("Client is offline. Check network or broker status.");
            });
        },
        async fetch_local_notification() {
            try {
                const db = await openDB("STICHH_LOCALDATABASE", 7);
                if (!db.objectStoreNames.contains("STORE_NOTIFICATIONS_LIST")) {
                    console.warn("STORE_NOTIFICATIONS_LIST does not exist, returning empty array");
                    return [];
                }
                const store = db
                    .transaction("STORE_NOTIFICATIONS_LIST")
                    .objectStore("STORE_NOTIFICATIONS_LIST");
                const allResources = await store.getAll();
                return allResources || [];
            } catch (error) {
                console.error("Error fetching local notifications:", error);
                return [];
            }
        },
        subscribeToTopicMethod(topic) {
            //Subscribe to a topic

            this.client.subscribe(topic, (err) => {
                if (err) {
                    this.$store.commit("SetmqqtColor", "red")
                    console.error("Subscription error:", err);
                } else {
                    // console.log("Subscribed to topic:", topic);
                }
            });

            // Publish a message

        },
        publishMethod(topic, msg) {
            // console.log(this.client)
            this.client.publish(topic, msg, this.options, (err) => {
                // console.log(topic, msg, this.options)
                if (err) {
                    console.error("Publish error:", err);
                } else {
                    // console.log("Message published successfully.");
                }
            });
        },
        unsubscribeToTopicMethod(topic) {

            //Subscribe to a topic
            // console.log(topic, 'topic')
            this.client.subscribe(topic, (err) => {
                if (err) {
                    console.error("UnSubscription error:", err);
                } else {
                    // console.log("unSubscribed to topic:", topic);
                }
            });
        },
        disconnectmqqt() {
            // console.log(this.client)
            this.client.end(() => {
                // console.log('Disconnected from the broker');
            });
        },
        async signing_out(msg_sent_by) {
            try {
                // Sign out from AWS Amplify Auth
                await Auth.signOut();
            } catch (error) {
                console.error("Error signing out from Auth:", error);
            }

            // Clear all Vuex store data
            this.$store.commit("SetAuth", false);
            this.$store.commit("SetUserEmail", "");
            this.$store.commit("SetUserObj", {});
            this.$store.commit("Setloginaudit", false);
            this.$store.commit("SetmqqtColor", "red");
            this.$store.commit("SetBreadCrumbs", []);
            this.$store.commit("SetFirstSignup", false);
            this.$store.commit("SetflowZeroStep", []);
            this.$store.commit("SetOrgLogo", "");
            this.$store.commit("SetUserEmailTeam", "");
            this.$store.commit("SetOrgDetails", {});
            this.$store.commit("SetFormObj", {});
            this.$store.commit("Setappitems", {});
            this.$store.commit("SetFlowItem", {});
            this.$store.commit("SetLeaveType", []);
            this.$store.commit("Setproductitems", {});
            this.$store.commit("Setpathinfo", "");
            this.$store.commit("SetCRMForm", {});
            this.$store.commit("Setdashboarditems", {});
            this.$store.commit("SetMessageitems", {});
            this.$store.commit("Setappadmins", false);
            this.$store.commit("Setnamesearch", "");
            this.$store.commit("SetformLibrary", false);
            this.$store.commit("SetFormType", "");
            this.$store.commit("SetMqttClient", null);
            this.$store.commit("SetadministrationCheck", false);
            this.$store.commit("SetadminAppsCheck", false);
            this.$store.commit("SetFormName", "");
            this.$store.commit("SetEditFormDetails", {});
            this.$store.commit("SetFormLibObject", {});
            this.$store.commit("SetAuditActions", {});
            this.$store.commit("SetInitiatorId", "");
            this.$store.commit("SetDirectoryForm", false);
            this.$store.commit("Setreporttracker", {});
            this.$store.commit("Setlibraryformtype", "");
            this.$store.commit("SetdashboardDetails", {});
            this.$store.commit("SetExternalForm", false);
            this.$store.commit("SetPublishMessage", []);
            this.$store.commit("SetTvdetails", {});
            this.$store.commit("SetCustomFormDesign", false);
            this.$store.commit("Settvboardback", false);
            this.$store.commit("SetVisitorFormEnabled", false);
            this.$store.commit("SetappName", "");
            this.$store.commit("Setappicon", "");
            this.$store.commit("Setvisitdetails", {});
            this.$store.commit("SetVisitorFormEdit", false);
            this.$store.commit("SetTermsandConditions", {});
            this.$store.commit("SetdragCheck", false);
            this.$store.commit("SetstockStatus", "");
            this.$store.commit("SetcustomerDetails", {});
            this.$store.commit("SetcustomerData", {});
            this.$store.commit("Setvendorbulkback", false);
            this.$store.commit("SetChecklist", {});
            this.$store.commit("ClearWebsiteBuilder");
            this.$store.commit("CLEAR_NOTIFICATIONS");
            this.$store.commit("CLEAR_TASKS");
            this.$store.commit("CLEAR_PENDING");
            this.$store.commit("CLEAR_APPLIST");
            this.$store.commit("CLEAR_CHANNELS");
            this.$store.commit("CLEAR_CHATS");

            // Disconnect MQTT
            if (this.client) {
                this.disconnectmqqt();
            }

            // Clear localStorage
            localStorage.removeItem('vuex-state');
            localStorage.removeItem('auth');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userObj');

            // Redirect to login page
            this.$router.push("/");

            // Show logout message
            this.$store.commit("SetSnackBarComponent", {
                SnackbarVmodel: true,
                SnackbarColor: "info",
                SnackbarText: `You have been logged out by ${msg_sent_by || 'another session'}`,
                timeout: 5000,
                Top: true,
            });
        },
    },
};
