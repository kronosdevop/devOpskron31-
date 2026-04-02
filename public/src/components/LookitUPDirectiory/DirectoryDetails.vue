<template>
  <div>
    <!-- Modern App Bar -->
    <v-app-bar class="modern-header-section">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-folder-multiple</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">{{ $store.getters.GetFormName }}</span>
          <span class="header-subtitle">Directory management and configuration</span>
        </div>
      </div>
      <v-spacer />
      <div class="header-actions">
        <!-- Export Button for Entry Management -->
        <v-btn
          v-show="allDirectoryEntries == 1"
          class="ml-15"
          color="primary"
          variant="flat"
          @click="export_entries()"
        >
          <v-icon>mdi-download</v-icon>
          <span>Export</span>
        </v-btn>

        <!-- Upload Component for Entry Management -->
        <UploadIndex
          v-show="allDirectoryEntries == 1"
          :on-success="handleSuccess"
          :before-upload="beforeUpload"
        />

        <!-- Add Entry Button for Entry Management -->
        <v-btn
          v-show="allDirectoryEntries == 1"
          class="action-btn add-btn"
          @click="fetch_entry_dialog()"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Add Entry</span>
        </v-btn>

        <!-- Add Users Button for Members -->
        <v-btn
          v-show="allDirectoryEntries == 3"
          class="action-btn add-btn"
          @click="add_users_list()"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Add Users</span>
        </v-btn>

        <!-- Back Button -->
        <v-btn class="mr-2" variant="flat" color="primary" @click="back_call()">
          <v-icon>mdi-step-backward</v-icon>
          <span>Back</span>
        </v-btn>
      </div>
    </v-app-bar>

    <!-- Modern Tabs Toolbar -->
    <v-toolbar flat class="mt-n10" style="background-color: white;">
      <template v-slot:extension>
        <v-tabs
          v-model="allDirectoryEntries"
          mandatory
          class="modern-tab-toggle"
          color="#DB4C77"
          slider-color="#DB4C77"
          
        >
          <v-tab value="0" class="tab-btn">
            <i>{{ $store.getters.GetFormName }}</i>
          </v-tab>
          <v-tab value="1" class="tab-btn">
            Entry Management
          </v-tab>
          <v-tab value="2" class="tab-btn">
            Form Template
          </v-tab>
          <v-tab
            v-show="
              $store.getters.GetFormObject.directory_visibility_type !=
              'ALL_MEMBERS'
            "
            value="3"
            class="tab-btn"
          >
            Members
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <!-- Content Area -->
    <v-card flat  class="overflow-y-auto mt-2">
      <OverlayComp :overlay="overlay" />

      <v-card-text>
        <SnackBar :SnackBarComponent="SnackBarComponent" />
        
        <!-- Tab Content -->
        <div v-if="allDirectoryEntries == 0">
          <DirectoryInfo />
        </div>
        <div v-if="allDirectoryEntries == 1">
          <EntryManagement :key="entryKey" :formInfo="formInfo" />
        </div>
        <div v-if="allDirectoryEntries == 2">
          <AdminFormDesigner />
        </div>
        <div v-if="allDirectoryEntries == 3">
          <DirectoryMembers :key="directoryMembersKey" />
        </div>

        <!-- Dialogs -->
        <div v-if="componentCheck == 1">
          <AddingNewEntry
            :addEntryDialog="addEntryDialog"
            @clicked="addEntryDialog = false"
            v-on:successMsg="success_info"
            v-on:errorMsg="error_info"
            :formInfo="formInfo"
          />
        </div>
        <div v-if="componentCheck == 2">
          <AddDeleteUsers
            :addDeleteMember="addDeleteMember"
            :actionType="actionType"
            :rowInfo="rowInfo"
            @clicked="addDeleteMember = false"
            v-on:successMsg="succes_info"
            v-on:errorMsg="error_info"
            v-on:validattions="error_info"
          />
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
/* eslint-disable */
import UploadIndex from "@/components/LookitUPDirectiory/AllDialogs/UploadIndex.vue";
import DirectoryInfo from "@/components/LookitUPDirectiory/AllDialogs/DirectoryInfo.vue";
import EntryManagement from "@/components/LookitUPDirectiory/AllDialogs/EntryManagement.vue";
import DirectoryMembers from "@/components/LookitUPDirectiory/AllDialogs/DirectoryMembers.vue";
import AuditLogs from "@/components/LookitUPDirectiory/AllDialogs/AuditLogs.vue";
import AdminFormDesigner from "@/components/FormDesigner/AdminFormDesigner.vue";
import AddingNewEntry from "@/components/LookitUPDirectiory/AllDialogs/AddingNewEntry.vue";
import AddDeleteUsers from "@/components/LookitUPDirectiory/AllDialogs/AddDeleteUsers.vue";
import APIInfo from "@/components/LookitUPDirectiory/AllDialogs/APIInfo.vue";
import { generate_directory_excel_report } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
const FileSaver = require("file-saver");
import OverlayComp from "@/components/OverlayComp.vue";

import axios from "axios";
import SnackBar from "@/components/SnackBar.vue";
export default {
  components: {
    DirectoryInfo,
    EntryManagement,
    DirectoryMembers,
    AddDeleteUsers,
    AuditLogs,
    AdminFormDesigner,
    AddingNewEntry,
    SnackBar,
    APIInfo,
    OverlayComp,
    UploadIndex,
  },
  props: {
    formInfo: Object,
    initialCreation: Number,
  },
  data() {
    return {
      allDirectoryEntries: 0,
      addEntryDialog: false,
      excelTableData: [],
      excelHeaders: [],
      componentCheck: 0,
      entryKey: 0,
      rowInfo: {},
      actionType: "Add",
      addDeleteMember: false,
      directoryMembersKey: 0,
      SnackBarComponent: {},
      overlay: false,
      windowHeight: 0,
    };
  },
  created() {
    this.allDirectoryEntries = this.initialCreation == 1 ? 2 : 0;
    this.windowHeight = window.innerHeight - 120;
  },
  methods: {
    back_call() {
      this.$emit("directoryemit", "back");
    },
    beforeUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 1;
      if (isLt1M) {
        return true;
      }
      this.$message({
        message: "Please do not upload files larger than 1m in size.",
        type: "warning",
      });
      return false;
    },
    handleSuccess({ results, header }) {
      this.excelTableData = results;

      this.excelHeaders = header;
      let customerData = {
        excelHeaders: this.excelHeaders,
        excelTableData: this.excelTableData,
      };
      this.$router.push("/home/BulkUploaddirectory");
      this.$store.commit("SetcustomerDetails", customerData);
    },
    fetch_entry_dialog() {
      this.componentCheck = 1;
      this.addEntryDialog = true;
    },

    add_users_list() {
      this.componentCheck = 2;
      this.addDeleteMember = true;
    },

    success_info(value) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
      this.addEntryDialog = false;
      this.entryKey++;
    },

    succes_info(val) {
      this.addDeleteMember = false;
      this.directoryMembersKey++;
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
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

    async export_entries() {
      this.overlay = true;
      try {
        let result = await API.graphql(
          graphqlOperation(generate_directory_excel_report, {
            input: {
              directory_id: this.$store.getters.GetFormObject.directory_id,
            },
          })
        );

        var response = JSON.parse(result.data.generate_directory_excel_report);
        this.download_invoice(response.URL);
        this.overlay = false;
      } catch (error) {}
    },

    async download_invoice(url) {
      this.exportload = false;
      var fileName = this.$store.getters.GetFormName + ".xlsx";
      axios({
        url: url,
        method: "GET",
        responseType: "blob", // Set the response type to blob
      })
        .then((response) => {
          const blob = new Blob([response.data], {
            type: response.headers["content-type"],
          });

          // Use the FileSaver library to save the file
          FileSaver.saveAs(blob, fileName);
        })
        .catch((error) => {
          console.error("Error downloading the file:", error);
        });
    },
  },
};
</script>

<style scoped>
/* Modern Header Section */












/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Action Button Styles */
.action-btn {
  background: #DB4C77 !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(219, 76, 119, 0.3) !important;
  transition: all 0.3s ease !important;
  text-transform: none !important;
  font-weight: 500 !important;
  padding: 8px 16px !important;
  min-height: 36px !important;
}

.action-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(219, 76, 119, 0.4) !important;
}

.add-btn {
  background: #DB4C77 !important;
}

.add-btn:hover {
  background: #c2185b !important;
}

.export-btn {
  background: #4CAF50 !important;
}

.export-btn:hover {
  background: #45a049 !important;
}

.back-btn {
  background: #757575 !important;
}

.back-btn:hover {
  background: #616161 !important;
}

/* Main Container Styles */
div {
  background-color: white !important;
}

/* Toolbar Styles */
.v-toolbar {
  background-color: white !important;
}



/* Responsive Design */
@media (max-width: 768px) {
  .header-actions {
    gap: 8px;
  }
  
  .action-btn {
    padding: 6px 12px !important;
    min-height: 32px !important;
    font-size: 12px !important;
  }
  
  .header-title {
    font-size: 18px;
  }
  
  .header-subtitle {
    font-size: 12px;
  }
  

}

@media (max-width: 480px) {
  .header-left {
    gap: 12px;
  }
  
  .header-icon-bg {
    width: 32px;
    height: 32px;
  }
  
  .header-title {
    font-size: 16px;
  }
  
  .header-subtitle {
    font-size: 11px;
  }
  
  .action-btn {
    padding: 4px 8px !important;
    min-height: 28px !important;
    font-size: 11px !important;
  }
  
  .action-btn span {
    display: none;
  }
  

}
</style>