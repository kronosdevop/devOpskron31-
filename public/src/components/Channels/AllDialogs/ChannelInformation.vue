    <template>
                    <!-- eslint-disable -->

        <div>
        <v-card width="600">
            <v-card-text>
            <v-tabs v-model="tabvalue" direction="vertical">
                <v-tab value="overview">
                <v-icon start> mdi-alpha-i-circle-outline </v-icon>
                Overview
                </v-tab>
                <v-tab v-if="selectedChat.restricted_users" value="members">
                    <v-icon start> mdi-account-multiple-outline </v-icon>
                Members
                </v-tab>
                <v-tab value="apis">
                    <v-icon start class="ml-n8"> mdi-api </v-icon>
                    API's
                </v-tab>
    
                <v-window v-model="tabvalue">
                    <v-window-item value="overview">
                    <v-card flat>
                        <v-card-text>
                        <div class="d-flex justify-center">
                            <v-avatar size="35" class="" color="primaryColor">
                            <v-icon color="white">mdi-account-group</v-icon>
                            </v-avatar>
                        </div>
                        <!-- <div class="d-flex justify-center">
                            <div
                            class="font-weight-bold mt-2"
                            v-if="groupNameEdit == false"
                            >
                            {{ selectedChat.team_name }}
                            <v-icon
                                color="primaryColor"
                                v-if="
                                $store.getters.GetUserObj.user?.user_id ==
                                selectedChat.team_owner_id
                                "
                                small
                                @click="editteamName()"
                                >mdi-pencil</v-icon
                            >
                            </div>
                            <v-row v-else>
                            <v-form ref="form">
                                <v-text-field
                                outlined
                                dense
                                label="Name"
                                :rules="[(v) => !!v || 'Required']"
                                v-model="GroupName"
                                class="mt-4"
                                style="max-width: 80"
                                />
                            </v-form>
                            <v-btn
                                dark
                                :loading="loadingsave"
                                small
                                class="cardCss text-capitalize mt-4 ml-2"
                                @click="editgroup"
                            >
                                Save</v-btn
                            >
                            </v-row>
                        </div> -->
                        <div class="d-flex justify-center">
                            <div class="font-weight-bold mt-2">
                                {{ selectedChat.team_name }}
                            </div>
                        </div>
                        <div class="d-flex justify-center">
                            <div class="font-weight-bold mt-2">
                            Created On : {{ fetch_date(selectedChat.team_created_on) }}
                            </div>
                        </div>
                        <!-- <div class="d-flex justify-center">
                            <div class="font-weight-bold mt-2">
                            Created By :
                            {{ fetch_user_name(selectedChat.team_created_by) }}
                            </div>
                        </div> -->
                        <div class="d-flex justify-center">
                            <div v-if="!groupNewOwner" class="font-weight-bold mt-2">
                                Created By :
                                {{ fetch_user_name(selectedChat.team_created_by) }}
                                <v-icon
                                    v-if="selectedChat.team_owner_id == $store.getters.GetUserObj.user?.user_id"
                                    color="primaryColor"
                                    @click="groupNewOwner = true"
                                >
                                    mdi-swap-horizontal-bold
                                </v-icon>
                            </div>

                            <v-row v-else align="center">
                                <v-col cols="12" sm="8">
                                    <v-form ref="ownerform">
                                    <v-select
                                        v-model="selectUser"
                                        :items="userItems"
                                        item-title="full_user_name"
                                        item-value="user_email_id"
                                        label="Select New Owner"
                                        density="compact"
                                        class="mt-4"
                                        :rules="[(v) => !!v || 'required ']"
                                        variant="outlined"
                                    ></v-select>
                                </v-form>
                                </v-col>
                                <v-col cols="auto">
                                    <v-btn
                                        color="primary"
                                        :loading="loadingsave"
                                        size="small"
                                        class="text-capitalize mt-n4"
                                        @click="saveNewOwner"
                                    >
                                        Save
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </div>

                        </v-card-text>
                        <v-card-actions class="justify-center">
                        <!-- <v-btn
                            depressed
                            :loading="loading"
                            @click="exit_teams_message()"
                            dark
                            small
                            v-if="
                            selectedChat.team_owner_id !=
                            $store.getters.GetUserObj.user?.user_id
                            "
                            class="cardCss text-capitalize"
                        >
                            Exit Group
                        </v-btn> -->
                        <v-btn
                            variant="outlined"
                            size="small"
                            v-if="selectedChat.team_owner_id == $store.getters.GetUserObj.user?.user_id"
                            :loading="loadingdelete"
                            @click="delete_teams_message()"
                            color="error"
                            class="text-capitalize ml-2"
                        >
                            Delete Group
                        </v-btn>
                        </v-card-actions>
                    </v-card>
                    </v-window-item>
                    <v-window-item v-if="selectedChat.restricted_users" value="members">
                        <div v-if="memberView == false">
                        <div class="d-flex align-center">
                        <span class="font-weight-bold">
                            Members ({{ selectedChat.restricted_users.length }})
                        </span>
                        <v-spacer />
                        <v-btn
                            color="primary"
                            v-if="$store.getters.GetUserObj.user?.user_id == selectedChat.team_owner_id"
                            class="text-capitalize"
                            @click="memberView = true"
                        >
                            Add
                        </v-btn>
                        </div>
                        <v-list density="compact">
                        <v-list-item
                            v-for="chat in selectedChat.restricted_users"
                            :key="chat"
                            style="border-bottom: 1px solid black"
                        >
                            <v-list-item-title>
                                {{ fetch_userid_name(chat) }}
                                <!-- <v-icon
                                color="red"
                                v-show="
                                    $store.getters.GetUserObj.user?.user_id ==
                                    selectedChat.team_owner_id
                                "
                                small
                                v-if="
                                    selectedChat.team_owner_id != chat &&
                                    $store.getters.GetUserObj.user?.user_id != chat
                                "
                                >mdi-delete</v-icon
                                > -->
                            </v-list-item-title>
                        </v-list-item>
                        </v-list>
                    </div>
                    <div v-else>
                        <div class="d-flex align-center">
                        <v-icon
                            color="primaryColor"
                            class="mr-2"
                            @click="memberView = false"
                        >
                            mdi-arrow-left-bold-circle-outline
                        </v-icon>
                        <span class="font-weight-bold"> Add Members </span>
                        </div>
                        <v-list density="compact">
                        <v-text-field
                            variant="outlined"
                            density="compact"
                            label="Search"
                            v-model="searchQuery"
                        />
                        <v-btn
                            v-if="selectedUsers != 0"
                            color="primary"
                            class="text-capitalize pa-2 mt-n2 mb-2"
                            block
                            :loading="loading"
                            @click="create_teams_message()"
                        >
                            Add {{ selectedUsers.length }} Members
                        </v-btn>
                        <v-card flat :height="listHeight" class="overflow-auto">
                            <v-list>
                                <v-list-item
                                    v-for="chat in filteredUsers"
                                    :key="chat.user_id"
                                    style="border-bottom: 1px solid black"
                                >
                                    <template v-slot:prepend>
                                        <div
                                            v-if="chat.user_profile_pic_url != undefined && 
                                                  chat.user_profile_pic_url != 'N/A' && 
                                                  chat.user_profile_pic_url != ''"
                                        >
                                            <v-avatar size="32" class="mt-n1 mb-1 pt-n1">
                                                <v-img :src="chat.user_profile_pic_url" />
                                            </v-avatar>
                                        </div>
                                        <div v-else>
                                            <v-avatar
                                                size="34"
                                                class="mt-n1 mb-1 pt-n1"
                                                color="primaryColor"
                                            >
                                                <span class="text-white">
                                                    {{ chat.full_user_name.substring(0, 1) }}
                                                </span>
                                            </v-avatar>
                                        </div>
                                    </template>
                                    <v-list-item-title>
                                        {{ chat.full_user_name }}
                                    </v-list-item-title>
                                    <v-list-item-subtitle>
                                        {{ chat.designation }}
                                    </v-list-item-subtitle>
                                    <template v-slot:append>
                                        <v-checkbox
                                            v-model="selectedUsers"
                                            :value="chat"
                                            color="primaryColor"
                                        ></v-checkbox>
                                    </template>
                                </v-list-item>
                            </v-list>
                        </v-card>
                        </v-list>
                    </div>
                    </v-window-item>
                    <v-window-item value="apis">
                        <v-card flat>
                            <ChannelsAPIInfo
                                :UserDetails = "UserDetails"
                            />
                        </v-card>
                    </v-window-item>
                </v-window>
            </v-tabs>
            </v-card-text>
        </v-card>
        </div>
    </template>
    
    <script>
/* eslint-disable */

    import { AddUserToTeam, ExitFromGroupchat } from "@/graphql/mutations.js";
    import { edit_team_details } from "@/graphql/mutations.js";
    import { delete_stichh_channel } from "@/graphql/mutations.js";
    import { API, graphqlOperation } from "aws-amplify";
    import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
    import { change_ownership_channel } from "@/graphql/mutations.js";
    import ChannelsAPIInfo from "./ChannelsAPIInfo.vue";
    export default {
        props: {
        selectedChat: Object,
        allusers: Array,
        },
        components: {
            ChannelsAPIInfo,
        },
        mixins: [get_all_org_users],
        data() {
        return {
            allUSersNames: [],
            model: [],
            selectedUsers: [],
            selectUser: "",
            userItems: [],
            loading: false,
            groupNameEdit: false,
            groupNewOwner: false,
            loadingdelete: false,
            loadingsave: false,
            memberView: false,
            GroupName: "",
            searchQuery: "",
            tabvalue: "overview",
            listHeight: 0,
            UserDetails: [],
            filteredAllUsers: [],
        };
        },
        computed: {
        filteredUsers() {
            return this.filteredAllUsers.filter((chat) => {
            return chat.full_user_name
                .toLowerCase()
                .includes(this.searchQuery.toLowerCase());
            });
        },
        },
        async mounted() {
            this.UserDetails = this.selectedChat;
        this.listHeight = window.innerHeight - 350;
        await this.get_all_org_users();
        this.allUSersNames = this.orgUsers;
        
        this.filteredAllUsers = this.orgUsers.filter(
            (user) => user.user_status === "ACTIVE"
        );
        this.filteredAllUsers = this.filteredAllUsers.filter(
            (user) =>
            user.user_email_id !== this.$store.getters.GetUserObj.user?.user_email_id
        );

        this.filteredAllUsers = this.filteredAllUsers.filter(
            (item) => !this.selectedChat.restricted_users.includes(item.user_id)
        );
        
        this.GroupName = this.selectedChat.team_name;
        this.userItems = [];
// console.log("userItems", this.filteredAllUsers)
          this.filteredAllUsers.forEach((element) => {
            if (
              element.user_status == "ACTIVE" &&
              element.user_type != "CHATBOT" &&
              element.user_email_id != this.selectedChat.team_created_by
            ) {
              this.userItems.push({
                full_user_name: element.full_user_name,
                user_email_id: element.user_email_id,
              });
            }
          });
        },
        
        watch: {
        tabvalue() {
            this.groupNameEdit = false;
            this.memberView = false;
            this.selectedUsers = [];
        },
        },
        methods: {
        editgroup() {
            if (this.$refs.form.validate()) {
            this.edit_teams_message();
            }
        },
        editteamName() {
            this.groupNameEdit = true;
        },

        async edit_teams_message() {
            this.loadingsave = true;
    
            try {
            let result = await API.graphql(
                graphqlOperation(edit_team_details, {
                input: {
                    team_id: this.selectedChat.team_id,
                    team_name: this.GroupName,
                    team_description: this.GroupName,
                },
                })
            );
            var response = JSON.parse(result.data.edit_team_details);
            this.loadingsave = false;
            if (response.Status == "SUCCESS") {
                this.$emit("successMsg", response.Message);
                this.$emit("rowupdate", 0);
    
                this.$refs.form.reset();
            } else {
                this.$emit("errorMsg", response.Message);
            }
            } catch (error) {
            this.$emit("errorMsg", error.errors[0].message);
            this.loadingsave = false;
            }
        },
        async delete_teams_message() {
            this.loadingdelete = true;
            var data = this.$store.getters.GetUserObj;

            try {
            let result = await API.graphql(
                graphqlOperation(delete_stichh_channel, {
                input: {
                    team_id: this.selectedChat.team_id,
                    user_email_id: data.user.user_email_id,
                },
                })
            );
            var response = JSON.parse(result.data.delete_stichh_channel);
            this.loadingdelete = false;
            if (response.Status == "SUCCESS") {
                this.$emit("successMsg", response.Message);
                this.$emit("rowupdate", 0);
    
                this.$refs.form.reset();
            } else {
                this.$emit("errorMsg", response.Message);
            }
            } catch (error) {
            this.$emit("errorMsg", error.errors[0].message);
            this.loadingdelete = false;
            }
        },
        async exit_teams_message() {
            this.loading = true;
    
            try {
            let result = await API.graphql(
                graphqlOperation(ExitFromGroupchat, {
                input: {
                    team_id: this.selectedChat.team_id,
                },
                })
            );
            var response = JSON.parse(result.data.ExitFromGroupchat);
            this.loading = false;
            if (response.Status == "SUCCESS") {
                this.$emit("successMsg", response.Message);
                this.$emit("successMsgexit", 0);
                this.$refs.form.reset();
            } else {
                this.$emit("errorMsg", response.Message);
            }
            } catch (error) {
            this.$emit("errorMsg", error.errors[0].message);
            this.loading = false;
            }
        },
        async create_teams_message() {
            this.loading = true;
            var data = this.$store.getters.GetUserObj;
            var users = this.selectedUsers.map((user) => user.user_id);
    
            try {
            let result = await API.graphql(
                graphqlOperation(AddUserToTeam, {
                input: {
                    team_id: this.selectedChat.team_id,
                    action_type: "ADD",
                    user_id: users,
                },
                })
            );
            var response = JSON.parse(result.data.AddUserToTeam);
            this.loading = false;
            if (response.Status == "SUCCESS") {
                this.$emit("successMsg", response.Message);
                this.$emit("rowupdate", 0);
            } else {
                this.$emit("errorMsg", response.Message);
            }
            } catch (error) {
            this.$emit("errorMsg", error.errors[0].message);
            this.loading = false;
            }
        },
        fetch_user_name(value) {
            var name = "";
            this.allUSersNames.forEach((element) => {
            if (element.user_email_id == value) {
                name = element.full_user_name;
            }
            });
            return name;
        },
        fetch_userid_name(value) {
            var name = "";
            this.allUSersNames.forEach((element) => {
            if (element.user_id == value) {
                name = element.full_user_name;
            }
            });
            return name;
        },
        fetch_date(val) {
            const d = new Date(parseInt(val * 1000));
            var date = d.getDate().toLocaleString();
            var month = (d.getMonth() + 1).toLocaleString();
            var year = d.getFullYear();
    
            return (
            (+date <= 9 ? "0" + date : date) +
            "-" +
            (+month <= 9 ? "0" + month : month) +
            "-" +
            year
            );
        },
        saveNewOwner() {
            if(this.$refs.ownerform.validate()) {
                this.transfer_Ownership_save()
            }
        },

        async transfer_Ownership_save() {
            this.loadingsave = true;
            var data = this.$store.getters.GetUserObj;
            // console.log(this.entryInfo.responseObject.directory_id);
            try {
                let result = await API.graphql(
                graphqlOperation(change_ownership_channel, {
                    input: {
                    team_id: this.selectedChat.team_id,
                    user_email_id: this.selectUser,
                    organization_id: data.organization.organization_id,
                    },
                })
                );
                this.loadingsave = false;
                var response = JSON.parse(result.data.change_ownership_channel);

                if (response.Status == "SUCCESS") {
                    this.$emit("successMsg", response.Message);
                    this.$emit("rowupdate", 0); 
                    this.groupNewOwner = false;
                } else {
                this.$emit("errorMsg", response.Message);
                this.groupNewOwner = false;
            }
            } catch (error) {
                this.loadingsave = false;
                this.groupNewOwner = false;
                this.$emit("errorMsg", error.errors[0].message);
            }
        },
        },
    };
    </script>
    
    <style>
    </style>