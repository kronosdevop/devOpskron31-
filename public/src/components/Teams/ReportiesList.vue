<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card variant="flat">
      <v-toolbar class="mt-4 bg-white" density="compact" variant="flat">
        <v-spacer />
        <v-autocomplete
          v-model="assetHead"
          label="Transfer To"
          :items="masterUsers"
          :search-input.sync="searchF"
          item-text="title"
          item-value="value"
          density="compact"
          variant="outlined"
          hide-no-data
          hide-selected
          return-object
          class="mt-6 mr-5"
          style="max-width: 250px"
        />
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
          density="compact"
          class="elevation-1 dtwidth"
        >
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
/* eslint-disable */
import SnackBar from "@/components/SnackBar.vue";
import { get_all_users } from "@/mixins/GetAllUsers.js";

// import { my_team_user_list } from "@/graphql/queries.js";
// import { API, graphqlOperation } from "aws-amplify";
export default {
  components: {
    SnackBar,
  },
  mixins: [get_all_users],

  data() {
    return {
      headers: [
        { title: "Profile", value: "user_profile_pic_url", sortable: false },
        { title: "Name", value: "full_user_name", sortable: false },
        {
          title: "Group",
          title: "department",
          sortable: false,
        },
      ],
      tableData: [],
      tableLoading: false,
      next_token: null,
      assetHead: "",
      masterUsers: [],
      searchF: null,
      // pagination: {
      //   itemsPerPage: 20,
      //   page: 1,
      // },
      SnackBarComponent: {},
      search: "",
      fixed: true,
      height: 0,
    };
  },
  async created() {
    this.height = window.innerHeight - 260;
    await this.get_all_users();
    await this.fetch_users();
  },

  // mounted() {
  // this.get_my_team();
  // },
  methods: {
    // async get_my_team() {
    //     this.tableLoading = true;
    //     var data = this.$store.getters.GetUserObj;
    //     try {
    //     let result = await API.graphql(
    //         graphqlOperation(my_team_user_list, {
    //         input: {
    //             organization_id: data.organization.organization_id,
    //             user_email_id: data.user.user_email_id,
    //             limit: this.search != "" ? 1000 : 100,
    //             name_search: this.search,
    //             nextToken: this.search != "" ? null : this.next_token,
    //         },
    //         })
    //     );
    //     var dataArray = [];
    //     var response = JSON.parse(result.data.my_team_user_list);
    //     this.next_token = response.nextToken;
    //     if (response.Status == "SUCCESS") {
    //         // dataArray = response.user;
    //         // await this.fetch_S3_file(response.s3_team_url);
    //         dataArray = await this.fetch_S3_file(response.s3_team_url);
    //         await this.filter_based_on_visibility(dataArray);
    //         this.tableLoading = false;
    //         if (this.tableData.length > 0) {
    //                 this.selectedItem = this.tableData[0];
    //             }
    //     }
    //     } catch (error) {
    //     this.tableLoading = false;
    //     this.SnackBarComponent = {
    //         SnackbarVmodel: true,
    //         SnackbarColor: "red",
    //         SnackbarText: error.errors[0].message,
    //         timeout: 5000,
    //         Top: true,
    //     };
    //     }
    // },

    fetch_users() {
      this.masterUsers = [];
      this.listUsers.forEach((element) => {
          this.masterUsers.push({
            title: element.full_user_name,
            value: element.user_email_id,
          });

        this.masterUsers.sort((a, b) => a.title.localeCompare(b.title));
      });
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
  background-color: #1976d2;
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
