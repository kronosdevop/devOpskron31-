<template>
  <div>
    <v-card flat>
      <v-form ref="form">
        <SnackBar :SnackBarComponent="SnackBarComponent" />

        <!-- <v-toolbar class="mt-4" dense flat>
          <v-spacer />
          <v-btn
            v-show="tagDisplay == true"
            dark
            @click="create_tags()"
            class="text-capitalize cardCss ml-2 mt-n7"
          >
            Add
          </v-btn>
        </v-toolbar> -->
      </v-form>
      <v-card-text>
        <v-data-table
          :headers="tagHeaders"
          :fixed-header="fixed"
          :items="tagRecords"
          :loading="tableLoading"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          hide-default-footer
          :items-per-page="20"
          density="compact"
          class="elevation-1 mt-n2 dtwidth"
        >
          <template v-slot:[`item.sub_tag`]="{ item }">
            <span>{{
              item.sub_tag.length != 0
                ? JSON.parse(item.sub_tag[0]).join(",")
                : ""
            }}</span>
          </template>
          <template v-slot:[`item.tag_status`]="{ item }">
            <v-btn
              text
              v-if="item.tag_status == 'DEACTIVE'"
              color="red"
              class="white--text ml-n1"
              >Disabled</v-btn
            >
            <!-- @click.stop="handleItemClick2(item)" -->
            <v-btn
              text
              v-if="item.tag_status == 'ACTIVE'"
              small
              color="green"
              class="white--text"
              >Enabled</v-btn
            >
            <!-- @click.stop="handleItemClick2(item)" -->
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon
              v-if="item.tag_status == 'DEACTIVE'"
              small
              @click="activate_deactivate_dialog(item)"
              dense
              color="green"
              >mdi-check-circle</v-icon
            >
            <v-icon
              v-if="item.tag_status == 'ACTIVE'"
              small
              @click="activate_deactivate_dialog(item)"
              dense
              color="orange"
              >mdi-close-circle</v-icon
            >

            <v-icon
              v-if="item.tag_status == 'ACTIVE'"
              small
              @click="edit_dialog(item)"
              dense
              color="primaryColor"
              >mdi-pencil</v-icon
            >
            <v-icon
              v-if="item.tag_status == 'ACTIVE'"
              small
              @click="delete_dialog(item)"
              dense
              color="red"
              >mdi-delete</v-icon
            >
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <AssetTagCreation
        :existingRecords="existingRecords"
        :createAssetDialog="createAssetDialog"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="createAssetDialog = false"
      />
    </div>
    <div v-if="componentCheck == 2">
      <AddSubTags
        :addSubTagDialog="addSubTagDialog"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="addSubTagDialog = false"
      />
    </div>
    <div v-if="componentCheck == 3">
      <AssetsTagsDelete
        :deletetagDialog="deletetagDialog"
        :rowInfo="rowInfo"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="deletetagDialog = false"
      />
    </div>

    <div v-if="componentCheck == 4">
      <EditAssetTags
        :rowInfo="rowInfo"
        :editTagDialog="editTagDialog"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="editTagDialog = false"
      />
    </div>

    <div v-if="componentCheck == 5">
      <ActivateDeactivateTags
        :activateDeactivate="activateDeactivate"
        :rowInfo="rowInfo"
        v-on:successMsg="success_info"
        v-on:errorMsg="error_info"
        @clicked="activateDeactivate = false"
      />
    </div>
  </div>
</template>
<script>
/*eslint-disable*/
import { create_list_delete_tags } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

import AddSubTags from "@/components/Asset/Popups/AddSubTags.vue";
import AssetTagCreation from "@/components/Asset/Popups/AssetTagCreation.vue";
import AssetsTagsDelete from "@/components/Asset/Popups/AssetsTagsDelete.vue";
import EditAssetTags from "@/components/Asset/Popups/EditAssetTags.vue";
import ActivateDeactivateTags from "@/components/Asset/Popups/ActivateDeactivateTags.vue";

import SnackBar from "@/components/SnackBar.vue";

export default {
  components: {
    SnackBar,
    AssetTagCreation,
    AddSubTags,
    AssetsTagsDelete,
    EditAssetTags,
    ActivateDeactivateTags,
  },
  data() {
    return {
      SnackBarComponent: {},
      tagHeaders: [
        {
          title: "Name",
          key: "tag_name",
          sortable: false,
        },
        // {
        //   title: "Tag Name",
        //   key: "tag_name",
        //   sortable: false,
        // },
        {
          title: "Value",
          key: "sub_tag",
          sortable: false,
        },
        { title: "Status", key: "tag_status", sortable: false },
        {
          title: "Actions",
          key: "actions",
          sortable: false,
        },
      ],
      tableLoading: false,
      tagRecords: [],
      fixed: false,
      componentCheck: 0,
      tagDisplay: false,
      existingRecords: [],
      createAssetDialog: false,
      // fixedTags: ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5"],
      rowInfo: {},
      addSubTagDialog: false,
      deletetagDialog: false,
      deleteItem: {},
      editTagDialog: false,
      activateDeactivate: false,
    };
  },
  created() {
    this.fetch_asset_tags();
    // console.log(this.displayedTags);
  },
  // computed: {
  //   displayedTags() {
  //     return this.fixedTags.map((tag, index) => {

  //       const record = this.tagRecords[index] || {
  //         tag_name: "",
  //         actions: "",
  //         tag_id: "",
  //         tag_prefix: "",
  //         tag_created_by_name: "",
  //       };
  //       return {
  //         tag: tag,
  //         ...record,
  //       };
  //     });
  //   },
  // },
  // computed: {
  //   displayedTags() {
  //     // Create a mapping of tag prefixes to their corresponding tags, if available
  //     const tagMap = this.tagRecords.reduce((acc, tag) => {
  //       acc[tag.tag_prefix] = tag;
  //       return acc;
  //     }, {});

  //     // Return an array of tags with appropriate data based on the prefix
  //     return this.fixedTags.map((tagPrefix) => {
  //       const record = tagMap[tagPrefix] || {
  //         tag_name: "",
  //         actions: "",
  //         tag_id: "",
  //         tag_prefix: tagPrefix,
  //         tag_created_by_name: "",
  //         sub_tags_count: 0,
  //       };
  //       return {
  //         tag: tagPrefix,
  //         ...record,
  //       };
  //     });
  //   },
  // },

  methods: {
    success_info(value) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green", // Change color to indicate an error
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
      this.addsubDialog = false;
      this.createAssetDialog = false;
      this.deletetagDialog = false;
      this.editTagDialog = false;
      this.activateDeactivate = false;
      this.fetch_asset_tags();
    },

    error_info(value) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red", // Change color to indicate an error
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
    },

    create_tags() {
      this.componentCheck = 1;
      this.createAssetDialog = true;
    },

    async fetch_asset_tags() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(create_list_delete_tags, {
            input: {
              user_email_id: data.user.user_email_id,
              action_type: "LIST_TAGS",
            },
          })
        );

        this.tableLoading = false;

        var response = JSON.parse(result.data.create_list_delete_tags);
        this.tableLoading = false;
        this.tagDisplay = true;
        if (response.Status == "SUCCESS") {
          this.existingRecords = response.data;
          this.tagRecords = response.data;
          this.tagRecords.sort((a, b) => {
            return a.tag_prefix.localeCompare(b.tag_prefix);
          });
        } else {
          this.tableLoading = false;
          this.tagRecords = [];
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red", // Change color to indicate an error
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        this.tableLoading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red", // Change color to indicate an error
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    add_sub_tags(item) {
      this.rowInfo = item;
      this.addSubTagDialog = true;
      this.componentCheck = 2;
    },

    activate_deactivate_dialog(item) {
      this.rowInfo = item;
      this.activateDeactivate = true;
      this.componentCheck = 5;
    },

    edit_dialog(item) {
      this.rowInfo = item;
      this.componentCheck = 4;
      this.editTagDialog = true;
    },

    delete_dialog(value) {
      this.deletetagDialog = true;
      this.componentCheck = 3;
      this.rowInfo = value;
      this.deleteItem = value;
    },
  },
};
</script>