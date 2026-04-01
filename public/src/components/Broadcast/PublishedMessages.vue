<template>
  <div>
    <v-card flat>
      <v-card-text class="ml-4">
        <v-data-table
          :headers="headers"
          :items="tableData"
          :height="height"
          :fixed-header="fixed"
          :loading="tableLoading"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          :items-per-page="20"
          dense
          class="elevation-1 dtwidth"
        >
          <template v-slot:[`item.message_published_on`]="{ item }">
            <span v-text="get_date(item.message_published_on)"></span>
          </template>
          <!-- <template v-slot:[`item.broadcast_description`]="{ item }">
            <v-tooltip bottom>
              <template #activator="{ on }">
                <div
                  v-if="item.broadcast_description"
                  class="caption"
                  v-on="on"
                 
                >
                  {{
                    item.broadcast_description.length >= 30
                      ? item.broadcast_description.substr(0, 30) + "..."
                      : item.broadcast_description
                  }}
                </div>
                <div v-else>-</div>
              </template>
              <span>{{ item.broadcast_description }}</span>
            </v-tooltip>
          </template> -->
          <template v-slot:[`item.broadcast_source_url`]="{ item }">
            <a
              :href="formatLink(item.broadcast_source_url)"
              target="_blank"
              v-if="
                item.broadcast_source_url != 'N/A' &&
                item.broadcast_source_url != undefined
              "
            >
              <v-icon color="green">mdi-web</v-icon>
            </a>
            <span
              v-if="
                item.broadcast_source_url == 'N/A' ||
                item.broadcast_media_url == undefined
              "
              ><v-icon color="green" disabled>mdi-web</v-icon></span
            >
          </template>
          <template v-slot:[`item.broadcast_media_url`]="{ item }">
            <a
              :href="formatLink2(item.broadcast_media_url)"
              target="_blank"
              v-if="
                item.broadcast_media_url != 'N/A' &&
                item.broadcast_media_url != undefined
              "
            >
              <v-icon color="green">mdi-file-document</v-icon>
            </a>
            <span
              v-if="
                item.broadcast_media_url == 'N/A' ||
                item.broadcast_media_url == undefined
              "
              ><v-icon color="green" disabled>mdi-file-document</v-icon></span
            >
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon color="" small class="mr-2" @click="view_description(item)">
              mdi-eye
            </v-icon>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <GroupcastDesc
        :viewDialog="viewDialog"
        :rowInfo="rowInfo"
        @clicked="viewDialog = false"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import SnackBar from "@/components/SnackBar.vue";
import GroupcastDesc from "@/components/Broadcast/BroadcastPopups/GroupcastDesc.vue";

import { list_messages } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  // props: {
  //   broadcast_info: Object,
  // },
  components: {
    SnackBar,
    GroupcastDesc,
  },
  data() {
    return {
      SnackBarComponent: {},
      tableLoading: false,
      headers: [
        { text: "Title", value: "title", sortable: false },
        // {
        //   text: "  Description",
        //   value: "description",
        //   sortable: false,
        // },
        {
          text: "Published On",
          value: "message_published_on",
          sortable: false,
        },
        // { text: "Published By", value: "broadcast_by", sortable: false },

        // {
        //   text: "  Media ",
        //   value: "image_url",
        //   sortable: false,
        // },
        // {
        //   text: "Source Infomation",
        //   value: "information_url",
        //   sortable: false,
        // },
        {
          text: "Action",
          value: "actions",
          sortable: false,
        },
      ],
      tableData: [],
      fixed: true,
      rowInfo: {},
      componentCheck: 0,
      viewDialog: false,
    };
  },
  created() {
    this.list_all_messages();

    this.height = window.innerHeight - 270;
  },
  methods: {
    get_date(date) {
      let a = new Date(date).toLocaleTimeString("en-In", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return a.toUpperCase();
    },
    formatLink(broadcast_source_url) {
      if (
        broadcast_source_url.startsWith("http://") ||
        broadcast_source_url.startsWith("https://")
      ) {
        return broadcast_source_url;
      } else {
        return `http://${broadcast_source_url}`;
      }
    },
    formatLink2(broadcast_media_url) {
      if (
        broadcast_media_url.startsWith("http://") ||
        broadcast_media_url.startsWith("https://")
      ) {
        return broadcast_media_url;
      } else {
        return `http://${broadcast_media_url}`;
      }
    },

    async list_all_messages() {
      this.tableLoading = true;
      // var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_messages, {
            input: {
              // organization_id: data.organization.organization_id,
              message_topic_id:
                this.$store.getters.GetMessageitems.team_topic_id,
              limit: 100,
              nextToken: null,
            },
          })
        );
        this.tableLoading = false;
        this.tableData = [];

        var response = JSON.parse(result.data.list_messages);

        response.items.forEach((element) => {
          this.tableData.push({
            title: element.broadcast_message.title,
            broadcast_message: element.broadcast_message,
            message_published_on: element.message_published_on,
          });
        });

        // if (response.Status == "SUCCESS") {
        //   this.tableData = response.data;
        // } else {
        //   this.SnackBarComponent = {
        //     SnackbarVmodel: true,
        //     SnackbarColor: "red",
        //     SnackbarText: response.Message,
        //     timeout: 5000,
        //     Top: true,
        //   };
        // }
        // response.details = response.details.sort((a, b) => {
        //   return a.localeComapre.workflow_name(b.workflow_name);
        // });
        // this.tableData = response.details;
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
    view_description(value) {
      this.viewDialog = true;
      this.componentCheck = 1;
      this.rowInfo = value;
    },
  },
};
</script>

<style>
</style>