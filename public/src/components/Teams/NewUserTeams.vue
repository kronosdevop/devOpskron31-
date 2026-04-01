<template>
    <div>
        <SnackBar :SnackBarComponent="SnackBarComponent" />
        <v-card flat class="mt-n4" >
            <v-row>
                <v-col cols="12" sm="6">
                    <v-toolbar
                        class="mt-4"
                        
                        dense
                        flat
                    >
                        <v-text-field
                            v-model="search"
                            label="Search"
                            outlined
                            placeholder="Min 3 Character"
                            class="mt-10 field_label_size FontSize"
                            style="max-width: 200px"
                            append-icon="mdi-magnify"
                            dense
                            ></v-text-field>
                        <v-spacer />
                        <!-- <v-btn
                            dark
                            class="text-capitalize cardCss ml-2 mt-4"
                            @click="back_call()"
                        >
                            <v-icon class="mr-2">mdi-step-backward</v-icon>
                            Back
                        </v-btn> -->
                    </v-toolbar>
                    <v-card-text>
                        <v-data-table
                            :headers="headers"
                            :items="tableData"
                            :loading="tableLoading"
                            :search="search"
                            :sort-by="['full_user_name']"
                            :footer-props="{
                            itemsPerPage: 100,
                            itemsPerPageOptions: [100, 200, 300],
                            }"
                            dense
                            class="elevation-1 dtwidth"
                            @click:row="selectRow"
                        >
                            <template #no-data>
                            <div class="text-center">No Team Available</div>
                            </template>
                            <template v-slot:[`item.user_profile_pic_url`]="{ item }">
                            <div
                                v-if="
                                item.user_profile_pic_url != 'N/A' &&
                                item.user_profile_pic_url != ''
                                "
                                class="caption"
                            >
                                <v-avatar size="32" class="mt-1 mb-1">
                                <v-img :src="item.user_profile_pic_url" />
                                </v-avatar>
                            </div>
                            <div v-else>
                                <v-avatar size="34" class="mt-1 mb-1" color="primaryColor">
                                <span class="white--text">
                                    {{ item.full_user_name.substring(0, 1) }}</span
                                >
                                </v-avatar>
                            </div>
                            </template>
                
                            <template v-slot:[`item.full_user_name`]="{ item }">
                            <span class="caption">{{ item.full_user_name }}</span>
                
                            <v-icon
                                small
                                color="primaryColor"
                                class="ml-1"
                                v-show="item.user_type == 'ADMIN' || item.user_type == 'OWNER'"
                                >mdi-account
                            </v-icon>
                            <br />
                            <span class="caption">{{ item.user_email_id }}</span>
                            </template>
                            <template v-slot:[`item.user_contact_number`]="{ item }">
                            <span class="caption">{{
                                item.user_country_code == "N/A"
                                ? "-"
                                : item.user_country_code + " " + item.user_contact_number ==
                                    "N/A"
                                ? ""
                                : item.user_country_code + " " + item.user_contact_number
                            }}</span>
                            <br />
                            <span class="caption">{{ item.member_id }}</span>
                            </template>
                            <template v-slot:[`item.location`]="{ item }">
                            <v-tooltip bottom>
                                <template #activator="{ on }">
                                <div v-if="item.location" v-on="on">
                                    {{
                                    item.location.length >= 10
                                        ? item.location.substr(0, 10)
                                        : item.location
                                    }}
                                </div>
                                <div v-else>-</div>
                                </template>
                                <div class="caption" style="max-width: 250px">
                                {{ item.location }}
                                </div>
                            </v-tooltip>
                            </template>
                            <template v-slot:[`item.reporting_manager`]="{ item }">
                            <span class="caption">{{
                                item.reporting_manager == "N/A" || item.reporting_manager == null
                                ? "-"
                                : item.reporting_manager
                            }}</span>
                            </template>
                            <template v-slot:[`item.user_status`]="{ item }">
                            <span v-if="item.user_status == 'ACTIVE'" class="caption">
                                <v-btn
                                small
                                text
                                class="white--text ml-n3 caption text-capitalize"
                                color="green"
                                >Active</v-btn
                                >
                            </span>
                            <span v-if="item.user_status == 'INVITED'" class="caption">
                                <v-btn
                                small
                                text
                                class="white--text ml-n3 caption text-capitalize"
                                color="orange"
                                >Invited</v-btn
                                >
                            </span>
                            <span v-if="item.user_status == 'REMOVED'" class="caption">
                                <v-btn
                                small
                                text
                                class="white--text ml-n3 caption text-capitalize"
                                color="red"
                                >Inactive</v-btn
                                >
                            </span>
                            </template>
                            <template v-slot:[`item.card_profile_url`]="{ item }">
                            <v-icon
                                color="primaryColor"
                                small
                                class="mr-2"
                                @click="copyToClipboard_x_api_key(item.card_profile_url)"
                            >
                                mdi-card-account-details
                            </v-icon>
                            </template>
                        </v-data-table>
                    </v-card-text>
                </v-col>
                <v-col cols="12" sm="6" style="margin-top: 80px;">
                    <v-card class="mr-2 pa-4">
                        <v-card outlined class="pa-3 d-flex flex-column align-center">
                            <v-avatar size="100">
                                <v-img 
                                    v-if="selectedItem?.user_profile_pic_url && selectedItem.user_profile_pic_url !== 'N/A'" 
                                    :src="selectedItem.user_profile_pic_url" 
                                    alt="Profile Picture"
                                />
                                <v-avatar v-else size="100" color="primaryColor">
                                    <span class="white--text text-h4">
                                        {{ selectedItem?.full_user_name?.substring(0, 1) || '?' }}
                                    </span>
                                </v-avatar>
                            </v-avatar>
                            <h3 class="mb-1">{{ selectedItem?.full_user_name || 'No Name' }}</h3>
                            <p class="mb-3">{{ selectedItem?.user_email_id || 'No Email' }}</p>

                            <v-row class="justify-center">
                                <v-col cols="auto" class="text-center">
                                    <v-btn class="mx-2" dark>
                                        <v-icon color="primary">mdi-chat</v-icon>
                                    </v-btn>
                                    <div class="text-caption mt-1">Chat</div>
                                </v-col>
                                <v-col cols="auto" class="text-center">
                                    <v-btn class="mx-2" dark>
                                        <v-icon color="primary">mdi-email</v-icon>
                                    </v-btn>
                                    <div class="text-caption mt-1">Email</div>
                                </v-col>
                                <v-col cols="auto" class="text-center">
                                    <v-btn class="mx-2" dark>
                                        <v-icon color="primary">mdi-receipt-text-check-outline</v-icon>
                                    </v-btn>
                                    <div class="text-caption mt-1">Task</div>
                                </v-col>
                                <v-col cols="auto" class="text-center">
                                    <v-btn class="mx-2" dark
                                        
                                    >
                                        <v-icon color="primary">mdi-card-account-details</v-icon>
                                    </v-btn>
                                    <div class="text-caption mt-1">Task</div>
                                </v-col>
                            </v-row>
                        </v-card>

                            <span class="text-left"><b>Basic Details</b></span>
                            <v-card outlined class="pa-3">
                                <div v-if="selectedItem">
                                    <p>First Name: <b>{{ selectedItem.first_name || 'N/A' }}</b></p>
                                    <p>Last Name: <b>{{ selectedItem.last_name || 'N/A' }}</b></p>
                                    <p>E-mail: <b>{{ selectedItem.user_email_id || 'N/A' }}</b></p>
                                    <p>Contact Number: <b>{{ selectedItem.user_country_code || '' }} {{ selectedItem.user_contact_number || 'N/A' }}</b></p>
                                    <p>Personal E-mail: <b>{{ selectedItem.personal_email_id || 'N/A' }}</b></p>
                                </div>
                                <div v-else>
                                    <p class="text-center">No User Selected</p>
                                </div>
                            </v-card>

                            <span class="text-left"><b>Work Details</b></span>
                            <v-card outlined class="pa-3">
                                <div v-if="selectedItem">
                                    <p>Member ID: <b>{{ selectedItem.member_id || 'N/A' }}</b></p>
                                    <p>Designation: <b>{{ selectedItem.designation || 'N/A' }}</b></p>
                                    <p>Reporting Manager: <b>{{ selectedItem.reporting_manager || 'N/A' }}</b></p>
                                    <p>Department/Group: <b>{{ selectedItem.designation || 'N/A' }}</b></p>
                                    <p>Location: <b>{{ selectedItem.location || 'N/A' }}</b></p>
                                    <p>Date of Joining: <b>{{ selectedItem.date_of_joining || 'N/A' }}</b></p>
                                    <p>Territory Name: <b>{{ selectedItem.personal_email_id || 'N/A' }}</b></p>
                                </div>
                                <div v-else>
                                    <p class="text-center">No User Selected</p>
                                </div>
                            </v-card>
                            <span class="text-left"><b>Personal Details</b></span>
                            <v-card outlined class="pa-3">
                                <div v-if="selectedItem">
                                    <p>Gender: <b>{{ selectedItem.gender || 'N/A' }}</b></p>
                                    <p>Date of Birth: <b>{{ selectedItem.date_of_birth || 'N/A' }}</b></p>
                                    <p>Blood Group: <b>{{ selectedItem.blood_group || 'N/A' }}</b></p>
                                    <p>Alternative Country Code: <b>{{ selectedItem.alternative_country_code || 'N/A' }}</b></p>
                                    <p>Alternative Contact Code: <b>{{ selectedItem.user_country_code || '' }} {{ selectedItem.alternative_contact_number || 'N/A' }}</b></p>
                                    <p>City/Area: <b>{{ selectedItem.city || 'N/A' }}</b></p>
                                    <p>Country: <b>{{ selectedItem.country || 'N/A' }}</b></p>
                                    <p>Address Line 1: <b>{{ selectedItem.address_1 || 'N/A' }}</b></p>
                                    <p>Address Line 2: <b>{{ selectedItem.address_2 || 'N/A' }}</b></p>
                                    <p>Permanent Address: <b>{{ selectedItem.permanent_address || 'N/A' }}</b></p>
                                </div>
                                <div v-else>
                                    <p class="text-center">No User Selected</p>
                                </div>
                            </v-card>
                            <span class="text-left"><b>Personal Identity Details</b></span>
                            <v-card outlined class="pa-3">
                                <div v-if="selectedItem">
                                    <p>Nationality: <b>{{ selectedItem.nationality|| 'N/A' }}</b></p>
                                    <p>Passport Number: <b>{{ selectedItem.passport_number || 'N/A' }}</b></p>
                                    <p>Passport Expiry Date: <b>{{ selectedItem.passport_expiry || 'N/A' }}</b></p>
                                    <p>Government Id Number: <b>{{ selectedItem.government_id || 'N/A' }} {{ selectedItem.user_contact_number }}</b></p>
                                    <p>Insurance Name: <b>{{ selectedItem.insurance_name || 'N/A' }}</b></p>
                                    <p>Insurance ID: <b>{{ selectedItem.insurance_id || 'N/A' }}</b></p>
                                    <p>Insurance Expiry Date: <b>{{ selectedItem.insursnce_expiry || 'N/A' }}</b></p>
                                    <p>Driving Licence ID: <b>{{ selectedItem.driving_licence || 'N/A' }}</b></p>
                                    <p>Driving Expiry Date: <b>{{ selectedItem.driving_expiry || 'N/A' }}</b></p>
                                    <p>Adhaar Number: <b>{{ selectedItem.adhaar_number || 'N/A' }}</b></p>
                                    <p>PAN Number: <b>{{ selectedItem.pan_number || 'N/A' }}</b></p>
                                    <p>Bank Account Number: <b>{{ selectedItem.bank_account_number || 'N/A' }}</b></p>
                                </div>
                                <div v-else>
                                    <p class="text-center">No User Selected</p>
                                </div>
                            </v-card>
                    </v-card>
                </v-col>
            </v-row>
        </v-card>
    </div>
</template>
    <script>
    /* eslint-disable */
    import SnackBar from "@/components/SnackBar.vue";
    import { EventBus } from "@/main";
    import LoadingNew from "@/components/LoadingNew.vue";
    import { my_team_user_list } from "@/graphql/queries.js";
    import { API, graphqlOperation } from "aws-amplify";
    export default {
        components: {
        SnackBar,
        LoadingNew,
        },
        data() {
        return {
            headers: [
            { text: "Profile", value: "user_profile_pic_url", sortable: false },
            { text: "Name", value: "full_user_name", sortable: false },    
            {
                text: "Group",
                value: "department",
                sortable: false,
            },
            ],
            tableData: [],
            tableLoading: false,
            next_token: null,
            componentCheck: 0,
            // pagination: {
            //   itemsPerPage: 20,
            //   page: 1,
            // },
            SnackBarComponent: {},
            search: "",
            fixed: true,
            height: 0,
            selectedItem: null,
        };
        isVisible: false;
        },
        created() {
        this.isVisible = true;
        this.height = window.innerHeight - 260;
        },

        mounted() {
        this.get_my_team();
        },
        methods: {
        selectRow(event, { item }) {
            this.selectedItem = item;
        },
        back_call() {
            this.$router.push("/DashboardView");
        },
        copyToClipboard_x_api_key(value) {
            const text = value;
            const el = document.createElement("textarea");
            el.value = text;
            el.setAttribute("readonly", "");
            el.style.position = "absolute";
            el.style.left = "-9999px";
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
            this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: "Copied Successfully",
            timeout: 5000,
            Top: true,
            };
            window.open(value, "_blank");
        },
    
        screen_refresh() {
            this.tableData = [];
            this.get_my_team();
        },
        open_new_tab(url) {
            window.open(url, "_blank");
        },
    
        get_myteam_Pagination() {
            if (this.next_token) {
            this.get_my_team();
            }
        },
    
        async get_my_team() {
            this.tableLoading = true;
            var data = this.$store.getters.GetUserObj;
            try {
            let result = await API.graphql(
                graphqlOperation(my_team_user_list, {
                input: {
                    organization_id: data.organization.organization_id,
                    user_email_id: data.user.user_email_id,
                    limit: this.search != "" ? 1000 : 100,
                    name_search: this.search,
                    nextToken: this.search != "" ? null : this.next_token,
                },
                })
            );
    
            var dataArray = [];
            var response = JSON.parse(result.data.my_team_user_list);
    
    
            this.next_token = response.nextToken;
    
            if (response.Status == "SUCCESS") {
                // dataArray = response.user;
                // await this.fetch_S3_file(response.s3_team_url);
                dataArray = await this.fetch_S3_file(response.s3_team_url);
                await this.filter_based_on_visibility(dataArray);
                this.tableLoading = false;
                if (this.tableData.length > 0) {
                        this.selectedItem = this.tableData[0];
                    }
            }
            } catch (error) {
            this.tableLoading = false;
            this.SnackBarComponent = {
                SnackbarVmodel: true,
                SnackbarColor: "red",
                SnackbarText: error.errors[0].message,
                timeout: 5000,
                Top: true,
            };
            }
        },
        async fetch_S3_file(value) {
            var responseData = null;
            var data = null;
            // this.loading = true;
            // this.errorMessage = "";
    
            try {
            const response = await fetch(value);
            if (!response.ok) {
                throw new Error("Failed to fetch the file");
            }
            responseData = await response.text();
            data = JSON.parse(responseData);
            // console.log(message.data);
            return data.message.data;
            } catch (error) {
            this.errorMessage = "Error fetching file: " + error.message;
            } finally {
            // this.loading = false;
            }
        },
    
        filter_based_on_visibility(response) {
            // console.log(response);
            var resposnearray = [];
            var teamVisbility = this.$store.getters.GetOrgDetails;
            let currentEmail = this.$store.getters.GetUserObj.user.user_email_id;
            let currentLocation = this.$store.getters.GetUserObj.user.location;
            let currentDepartment = this.$store.getters.GetUserObj.user.department;
    
            if (teamVisbility.organization.team_visibilty == "ALL_USERS") {
            resposnearray = response;
            } else if (
            teamVisbility.organization.team_visibilty == "USER_REPORTES_ONLY"
            ) {
            resposnearray = response.filter(
                (user) =>
                user.reporting_manager !== "N/A" &&
                user.reporting_manager.includes(currentEmail)
            );
            } else if (
            teamVisbility.organization.team_visibilty ==
            "USER_REPORTIES_AND_REPORTING_MANAGER"
            ) {
            resposnearray = response.filter((user) => {
                let isReportee =
                user.reporting_manager &&
                user.reporting_manager !== "N/A" &&
                user.reporting_manager.includes(currentEmail);
    
                let isManager =
                user.user_email_id ===
                    this.$store.getters.GetUserObj.user.reporting_manager &&
                this.$store.getters.GetUserObj.user.reporting_manager !== "N/A";
    
                return isReportee || isManager;
            });
            } else if (
            teamVisbility.organization.team_visibilty == "USER_COMMON_LOCATION"
            ) {
            resposnearray = response.filter(
                (user) =>
                user.location !== "N/A" && user.location.includes(currentLocation)
            );
            } else if (
            teamVisbility.organization.team_visibilty == "USER_COMMON_DEPARTMENT"
            ) {
            resposnearray = response.filter(
                (user) =>
                user.department !== "N/A" &&
                user.department.includes(currentDepartment)
            );
            }
            return (this.tableData = resposnearray);
        },
    
        fetch_value(val) {
            const d = new Date(parseInt(val));
            var date = d.getDate().toLocaleString();
            var month = (d.getMonth() + 1).toLocaleString();
            var year = d.getFullYear();
            var dateValue =
            (+date <= 9 ? "0" + date : date) +
            "/" +
            (+month <= 9 ? "0" + month : month) +
            "/" +
            year;
    
            return dateValue;
        },
    
        handle_row_click(value) {
            this.formInfo = value;
            this.componentCheck = 1;
            this.formDialog = true;
        },
    
        error_info(val) {
            this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: val,
            timeout: 5000,
            Top: true,
            };
        },
    
        async success_info(val) {
            this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: val,
            timeout: 5000,
            Top: true,
            };
            this.formDialog = false;
        },
        },
    };
    </script>

<style scoped>
/* Main Card: Fixed Height */
.scrollable-main-card {
    max-width: 1000px;
    min-height: 520px; /* Allows expansion */
    display: flex;
    flex-direction: column;
    border-radius: 10px;
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
}

.scrollable-content {
    flex: 1;
    overflow-y: auto;
    padding-right: 10px;
    scrollbar-width: thin; /* Firefox */
    scrollbar-color: rgba(100, 100, 100, 0.5) transparent; /* Firefox */
}

.scrollable-content::-webkit-scrollbar {
    width: 2px; /* Ultra-thin scrollbar */
}

.scrollable-content::-webkit-scrollbar-track {
    background: transparent; /* Hidden track */
}

.scrollable-content::-webkit-scrollbar-thumb {
    background: rgba(100, 100, 100, 0.6); /* Grey scrollbar */
    border-radius: 10px;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
    background: rgba(100, 100, 100, 0.8); /* Slightly darker on hover */
}

/* Circular Buttons */
.circle-btn {
    height: 56px;
    width: 56px;
    border-radius: 50%;
    justify-content: center;
    background-color: #1976D2;
    color: white;
}

/* Align Headers to the Left */
.text-left {
    display: block;
    text-align: left;
    margin-bottom: 10px;
    font-weight: bold;
}
</style>
