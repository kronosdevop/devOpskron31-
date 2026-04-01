<template>
  <div>
    <CreateExternalTicketDialog
      :DialogCreateExternalTicket="DialogCreateExternalTicket"
      :screenshot-file="ScreenshotFile"
      :org-details="orgDetails"
      @clicked="DialogCreateExternalTicketEmit"
    />
    <!-- App Bar -->
    <v-app-bar class="modern-header-section" elevation="0">
      <div class="header-left">
        <div class="header-icon-container">
          <div class="header-icon-bg">
            <v-icon color="white" size="24">mdi-format-list-checks</v-icon>
          </div>
        </div>
        <div class="header-text">
          <span class="header-title">Checklist</span>
          <span class="header-subtitle"
            >Manage your checklists and master templates</span
          >
        </div>
      </div>
      <v-spacer />
      <div class="header-actions">
        <!-- Action Buttons -->
        <!--Screenshot Button-->
        <v-tooltip text="Take a screenshot and raise a ticket">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon @click="TakeScreenshot">
              <v-icon size="30" color="primary">mdi-help-box</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-btn
          v-if="adminToggle == 'checklist'"
          @click="create_checklist()"
          class="action-btn mr-3"
          size="small"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Create Checklist</span>
        </v-btn>
        <v-btn
          v-if="adminToggle == 'apps'"
          @click="Add_Checklist()"
          class="action-btn mr-3"
          size="small"
        >
          <v-icon>mdi-plus</v-icon>
          <span>Create Masters</span>
        </v-btn>
      </div>
    </v-app-bar>

    <!-- Tab Toggle -->
    <v-toolbar flat class="mt-n10" style="background-color: white">
      <template v-slot:extension>
        <v-tabs v-model="adminToggle" mandatory class="modern-tab-toggle">
          <v-tab value="checklist" class="tab-btn"> CheckList </v-tab>
          <v-tab value="apps" class="tab-btn">
            Master Checklist Creation
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <v-card flat class="overflow-y-auto">
      <div class="text-left" v-if="adminToggle == 'checklist'">
        <ListChecklist :key="CheklistKey" />
      </div>
      <div class="text-left" v-if="adminToggle == 'apps'">
        <ChecklistUI :key="MasterKey" />
      </div>
    </v-card>

    <div v-if="componentCheck == 2">
      <AddChecklistDialog
        :addchecklistDialog="addchecklistDialog"
        @clicked="addchecklistDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        v-on:updaterefesh="updateMaster"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
<script>
/*eslint-disable*/
import ListChecklist from "./ListChecklist.vue";
import ChecklistUI from "@/components/CheckListComponent/ChecklistUI.vue";
// import ChecklistAddDialogue from "@/components/CheckListComponent/ChecklistAddDialogue.vue";
import AddChecklistDialog from "@/components/CheckListComponent/AddChecklistDialog.vue";
import SnackBar from "@/components/SnackBar.vue";
import html2canvas from "html2canvas";
import CreateExternalTicketDialog from "../Tickets/CreateExternalTicketDialog.vue";
// import AddChecklistMain from "./NewPopups/AddChecklistMain.vue";
export default {
  components: {
    ChecklistUI,
    ListChecklist,
    // ChecklistAddDialogue,
    // AddChecklistMain,
    AddChecklistDialog,
    SnackBar,
    CreateExternalTicketDialog,
  },
  data() {
    return {
      adminToggle: "checklist",

      createCheckListDialogue: false,
      addchecklistDialog: false,

      SnackBarComponent: {},

      // Screenshot Values
      DialogCreateExternalTicket: false,
      ScreenshotFile: null,
      orgDetails: {
        bucket_name: "stichh-medias",
        region: "us-east-1",
      },

      componentCheck: 0,
      MasterKey: 0,
      CheklistKey: 0,
      windowHeight: 0,
    };
  },
  mounted() {
    this.windowHeight = window.innerHeight - 200;
  },
  methods: {
    create_checklist() {
      // this.componentCheck = 1;
      // this.createCheckListDialogue = true;
      this.$router.push("/home/ChecklistCreation");
    },

    Add_Checklist() {
      this.componentCheck = 2;
      this.addchecklistDialog = true;
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
      this.addchecklistDialog = false;
      this.createCheckListDialogue = false;
    },
    updateMaster() {
      this.MasterKey++;
    },
    updateChecklist() {
      this.CheklistKey++;
    },
    async TakeScreenshot() {
      const target = document.body;
      const canvas = await html2canvas(target, {
        scale: window.devicePixelRatio || 2,
        useCORS: true,
        logging: false,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "screenshot.png", { type: "image/png" });
      this.ScreenshotFile = file;
      this.DialogCreateExternalTicket = true;
    },
    DialogCreateExternalTicketEmit() {
      this.DialogCreateExternalTicket = false;
    },
  },
};
</script>

<style scoped>
/* Modern Header Section */

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Action Button Styles */
.action-btn {
  background: #db4c77 !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(219, 76, 119, 0.3) !important;
  transition: all 0.3s ease !important;
  text-transform: none !important;
  font-weight: 500 !important;
  border-radius: 8px !important;
  padding: 8px 16px !important;
}

.action-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(219, 76, 119, 0.4) !important;
  background: #c2185b !important;
}

/* Tab Styles */
.modern-tab-toggle {
  background-color: white !important;
}

.tab-btn {
  background-color: white !important;
  text-transform: none !important;
  font-weight: 500 !important;
  color: #666 !important;
}

.tab-btn:hover {
  color: #db4c77 !important;
}

/* Toolbar Styles */
.v-toolbar {
  background-color: white !important;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .header-actions {
    gap: 8px;
  }

  .action-btn {
    padding: 6px 12px !important;
    font-size: 12px !important;
  }
}

@media (max-width: 768px) {
  .header-left {
    gap: 12px;
  }

  .header-icon-bg {
    width: 40px;
    height: 40px;
  }

  .header-title {
    font-size: 18px;
  }

  .header-subtitle {
    font-size: 12px;
  }

  .header-actions {
    flex-direction: column;
    gap: 8px;
  }

  .action-btn {
    padding: 6px 10px !important;
    font-size: 11px !important;
  }
}
</style>
