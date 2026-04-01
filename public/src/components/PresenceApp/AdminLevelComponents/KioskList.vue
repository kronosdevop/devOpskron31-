<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-toolbar
      color="transparent"
      elevation="0"
      class="mt-n3"
      density="compact"
    >
      <v-toolbar-title
        ><v-icon color="primary" class="mr-2">mdi-account-card</v-icon
        >Kiosk</v-toolbar-title
      >
    </v-toolbar>
    <v-container class="mt-n1">
      <v-card class="mt-n4" elevation="0" rounded="lg">
        <v-card-text>
          <v-row>
            <v-col cols="6">
              <v-card class="pa-3" elevation="6" rounded="lg">
                <v-toolbar
                  color="transparent"
                  density="compact"
                  class="mt-n4 ml-n4"
                >
                  <v-toolbar-title>Location</v-toolbar-title>
                  <v-btn
                    @click="add_action()"
                    size="small"
                    class="elevation-0 cardCss"
                  >
                    <v-icon dark> mdi-plus </v-icon>
                  </v-btn>
                </v-toolbar>
                <v-data-table
                  :headers="headers"
                  :height="CommonVuetifyObj.height - 340"
                  :fixed-header="fixed"
                  :items="tableData"
                  :loading="tableLoading"
                  :items-per-page="itemsPerPage"
                  hide-default-footer
                  density="compact"
                  class="elevation-1"
                >
                  <template v-slot:[`item.kiosk_name`]="{ item }">
                    <div class="d-flex align-center">
                      <!-- <v-icon color="primary">mdi-account</v-icon> -->
                      <div class="ml-2">{{ item.kiosk_name }}</div>
                    </div>
                  </template>
                  <template v-slot:[`item.kiosk_unique_id`]="{ item }">
                    <div class="d-flex align-center">
                      <!-- <v-icon color="green" size="small">mdi-id-card</v-icon> -->
                      <div class="ml-2">{{ item.kiosk_unique_id }}</div>
                    </div>
                  </template>
                  <template v-slot:[`item.location_name`]="{ item }">
                    <div class="d-flex align-center">
                      <!-- <v-icon color="blue" size="small"
                        >mdi-map-marker</v-icon
                      > -->
                      <div class="ml-2">{{ item.location_name }}</div>
                    </div>
                  </template>
                  <template v-slot:[`item.actions`]="{ item }">
                    <v-menu>
                      <template v-slot:activator="{ props }">
                        <v-btn
                          v-bind="props"
                          color="transparent"
                          icon
                          elevation="0"
                        >
                          <v-icon color="primary">mdi-dots-vertical</v-icon>
                        </v-btn>
                      </template>
                      <v-card>
                        <v-list density="compact">
                          <v-list-item>
                            <v-btn icon elevation="0" @click="edit_kiosk(item)">
                              <v-icon color="green">mdi-pencil</v-icon>
                            </v-btn>
                          </v-list-item>
                          <v-list-item>
                            <v-btn
                              icon
                              elevation="0"
                              @click="delete_kiosk(item)"
                            >
                              <v-icon color="red">mdi-delete</v-icon>
                            </v-btn>
                          </v-list-item>
                        </v-list>
                      </v-card>
                    </v-menu>
                  </template>
                </v-data-table>
                <div class="table-footer">
                  <div class="footer-info">
                    {{
                      totalItems === 0
                        ? "No Results"
                        : `Showing ${tableData.length} of ${tableData.length} locations`
                    }}
                  </div>
                  <div class="pagination-controls">
                    <v-btn
                      :diabled="currentPage === 1"
                      variant="text"
                      size="small"
                      class="pagination-btn"
                      @click="currentPage = currentPage - 1"
                      >Previous</v-btn
                    >
                    <div class="page-numbers">
                      <v-btn
                        v-for="page in visiblePages"
                        :key="page"
                        :variant="page === currentPage ? 'elevated' : 'text'"
                        size="small"
                        :class="
                          page === currentPage ? 'active-page' : 'inactive-page'
                        "
                        @click="currentPage = page"
                        >{{ page }}</v-btn
                      >
                    </div>
                    <v-btn
                      :disabled="currentPage === pageCount"
                      variant="text"
                      size="small"
                      class="pagination-btn"
                      @click="currentPage = currentPage + 1"
                      >Next</v-btn
                    >
                  </div>
                </div>
              </v-card>
            </v-col>

            <v-col cols="6">
              <v-card class="pa-2" elevation="6" rounded="lg">
                <v-toolbar
                  color="transparent"
                  density="compact"
                  class="mt-n3 ml-n4"
                >
                  <v-toolbar-title>Messages</v-toolbar-title>
                  <v-spacer />
                </v-toolbar>

                <v-list dense>
                  <div
                    ref="sortableEl"
                    class="sortable-list"
                    @dragover="allowDrop"
                    @drop="drop"
                  >
                    <v-list-item
                      v-for="(item, index) in kioskMessages"
                      :key="index"
                      class="custom-list-item"
                      :draggable="true"
                      @dragstart="dragStart(item, index)"
                      @dragend="dragEnd(item, index)"
                      @dragover="dragOver(index)"
                    >
                      <v-list-item-content>
                        <v-list-item-title class="message-item-title">
                          <div class="d-flex align-center">
                            <v-icon
                              size="small"
                              color="grey"
                              class="mr-2 drag-handle"
                            >
                              mdi-drag
                            </v-icon>
                            <span
                              >{{ index + 1 }})
                              {{ item.NAME.replaceAll("_", " ") }}</span
                            >
                          </div>

                          <template v-if="item.isEditing">
                            <v-textarea
                              v-model="item.MESSAGE"
                              variant="outlined"
                              style="max-width: 100%"
                              class="ma-2"
                              @blur="stopEditing(item)"
                              label="Edit Message"
                              autofocus
                              :rules="[(v) => !!v || 'Message cannot be empty']"
                            />
                          </template>

                          <template v-else>
                            <span class="message-text">{{ item.MESSAGE }}</span>
                            <v-icon
                              color="primary"
                              size="x-small"
                              @click="startEditing(item)"
                            >
                              mdi-pencil
                            </v-icon>
                          </template>
                        </v-list-item-title>

                        <v-divider
                          v-if="index < kioskMessages.length - 1"
                          :key="'divider-' + index"
                        ></v-divider>
                      </v-list-item-content>
                    </v-list-item>
                  </div>
                </v-list>

                <v-card-actions class="justify-end mt-5">
                  <v-btn
                    :loading="loading"
                    @click="validate_data()"
                    height="40"
                    class="cardCss button-corner text-capitalize"
                  >
                    Save
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>

    <div v-if="componentCheck == 1">
      <CreateKiosk
        :kioskCreation="kioskCreation"
        @clicked="kioskCreation = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componentCheck == 2">
      <EditKiosk
        :kioskEdition="kioskEdition"
        @clicked="kioskEdition = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        :kioskitem="kioskitem"
      />
    </div>
    <div v-if="componentCheck == 3">
      <DeleteKiosk
        :kioskDeletion="kioskDeletion"
        @clicked="kioskDeletion = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        :kioskitem="kioskitem"
      />
    </div>
  </div>
</template>

<script>
import DeleteKiosk from "@/components/PresenceApp/PopUps/DeleteKiosk.vue";
import EditKiosk from "@/components/PresenceApp/PopUps/EditKiosk.vue";
import CreateKiosk from "@/components/PresenceApp/PopUps/CreateKiosk.vue";
import {
  stichh_kiosk_function,
  update_list_kiosk_priority_message,
} from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
import { useDisplay } from "vuetify/lib/framework.mjs";

export default {
  components: {
    SnackBar,
    CreateKiosk,
    EditKiosk,
    DeleteKiosk,
  },
  data() {
    return {
      SnackBarComponent: {},
      CommonVuetifyObj: {},
      kioskCreation: false,
      kioskEdition: false,
      loading: false,
      kioskDeletion: false,
      componentCheck: 0,
      headers: [
        {
          title: "Name",
          value: "kiosk_name",
          sortable: false,
          width: "25%",
        },
        {
          title: "Unique Id",
          value: "kiosk_unique_id",
          sortable: false,
          width: "25%",
        },

        {
          title: "Location",
          value: "location_name",
          sortable: false,
          width: "25%",
        },
        {
          title: "Actions",
          value: "actions",
          sortable: false,
          width: "25%",
        },
      ],
      height: 0,
      page: 1,
      currentPage: 1,
      totalItems: 0,
      itemsPerPage: 10,
      fixed: true,
      endmodal: false,
      tableData: [],
      kioskMessages: [],
      kioskitem: {},
      tableLoading: false,
      CurrentDate: new Date().toISOString().substr(0, 10),
      draggedField: null,
      draggedIndex: null,
      dragOverIndex: null,
    };
  },
  created() {
    this.height = window.innerHeight - 305;
    this.kioskListing();
    this.kioskConfiguration();
  },
  computed: {
    pageCount() {
      if (this.tableData.length === 0) return 1;
      return Math.ceil(this.tableData.length / this.itemsPerPage);
    },
    visiblePages() {
      const totalPages = this.pageCount;
      const current = this.currentPage;
      const delta = 2;

      let start = Math.max(1, current - delta);
      let end = Math.min(totalPages, current + start);

      if (end - start < 4) {
        if (start === 1) {
          end = Math.min(totalPages, start + 4);
        } else {
          start = Math.max(1, end + 4);
        }
      }
      const pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  mounted() {
    this.CommonVuetifyObj = useDisplay();
  },
  methods: {
    async validate_data() {
      this.loading = true;
      this.kioskMessages.forEach((obj) => {
        delete obj.isEditing;
      });
      this.kioskMessages = this.kioskMessages.map((item, index) => ({
        ...item,
        PRIORITY: index + 1,
      }));
      let data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(update_list_kiosk_priority_message, {
            input: {
              action_type: "UPDATE",
              organization_id: data.organization.organization_id,
              kiosk_prorities: JSON.stringify(this.kioskMessages),
            },
          })
        );
        this.loading = false;
        let response = JSON.parse(
          result.data.update_list_kiosk_priority_message
        );
        if (response.Status == "SUCCESS") {
          this.loading = false;
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: "Updated Successfully",
            timeout: 5000,
            Top: true,
          };
          this.kioskConfiguration();
        } else {
          this.loading = false;
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        this.loading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText:
            (error.errors && error.errors[0] && error.errors[0].message) ||
            error.message ||
            "Something went wrong",
          timeout: 5000,
          Top: true,
        };
      }
    },
    startEditing(item) {
      item.isEditing = true;
    },
    stopEditing(item) {
      if (!item.MESSAGE.trim()) {
        item.MESSAGE = "";
        return;
      }
      item.isEditing = false;
    },
    allowDrop(event) {
      event.preventDefault();
    },
    dragStart(field, index) {
      this.draggedField = index;
    },
    dragEnd(field, index) {
      this.draggedField = null;

      if (this.dragOverIndex !== null) {
        // Move the field to the new position in the kioskMessages array
        const item = this.kioskMessages[index];
        this.kioskMessages.splice(index, 1);
        this.kioskMessages.splice(this.dragOverIndex, 0, item);
      }

      this.dragOverIndex = null;
    },
    dragOver(index) {
      this.dragOverIndex = index;
    },
    drop(event) {
      event.preventDefault();
    },
    add_action() {
      this.componentCheck = 1;
      this.kioskCreation = true;
    },
    delete_kiosk(item) {
      this.componentCheck = 3;
      this.kioskitem = item;
      this.kioskDeletion = true;
    },
    edit_kiosk(item) {
      this.componentCheck = 2;
      this.kioskitem = item;
      this.kioskEdition = true;
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
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.kioskCreation = false;
      this.kioskEdition = false;
      this.kioskDeletion = false;
      this.kioskListing();
    },
    async kioskListing() {
      this.tableLoading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(stichh_kiosk_function, {
            input: {
              action_type: "LIST_KIOSK",
            },
          })
        );
        this.tableLoading = false;
        var response = JSON.parse(result.data.stichh_kiosk_function);
        if (response.Status == "SUCCESS") {
          this.tableData = response.data;
          this.totalItems = this.tableData.length;
        } else {
          this.tableData = [];
          this.totalItems = 0;
        }
      } catch (error) {
        this.loading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText:
            (error.errors && error.errors[0] && error.errors[0].message) ||
            error.message ||
            "Something went wrong",
          timeout: 5000,
          Top: true,
        };
      }
    },
    async kioskConfiguration() {
      let data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(update_list_kiosk_priority_message, {
            input: {
              action_type: "LIST",
              organization_id: data.organization.organization_id,
            },
          })
        );

        let response = JSON.parse(
          result.data.update_list_kiosk_priority_message
        );

        if (response.Status == "SUCCESS") {
          this.kioskMessages = response.data;
        } else {
          this.kioskMessages = [];
        }
      } catch (error) {
        this.loading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText:
            (error.errors && error.errors[0] && error.errors[0].message) ||
            error.message ||
            "Something went wrong",
          timeout: 5000,
          Top: true,
        };
      }
    },
  },
};
</script>

<style>
.message-item-title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-size: 15px;
}

.message-text {
  word-wrap: break-word;
  white-space: normal;
  max-width: 100%;
  font-size: 14px;
}

.sortable-list {
  cursor: move;
}

.custom-list-item {
  transition: all 0.2s ease;
  cursor: grab;
  border-radius: 8px;
  margin-bottom: 4px;
}

.custom-list-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: grabbing;
  background-color: #f5f5f5;
}

.drag-handle {
  cursor: grab;
}

.drag-handle:hover {
  cursor: grabbing;
}

.sortable-ghost {
  opacity: 0.5;
  background: #c8e6c9 !important;
}

.sortable-chosen {
  background: #e8f5e8 !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.footer-info {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  font-size: 14px;
  font-weight: 500;
  color: #6c757d;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 4px;
}

.active-page {
  background-color: #db4c77 !important;
  color: white !important;
}

.inactive-page {
  color: #6c757d !important;
}
</style>
