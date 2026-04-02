<template>
  <div class="pow-page">
    <CreateExternalTicketDialog
      :DialogCreateExternalTicket="DialogCreateExternalTicket"
      :screenshot-file="ScreenshotFile"
      :org-details="orgDetails"
      @clicked="DialogCreateExternalTicketEmit"
    />

    <v-app-bar class="modern-header-section" flat>
      <div class="header-left">
        <div class="header-icon-bg">
          <v-icon color="white" size="22">mdi-shield-check</v-icon>
        </div>

        <div class="header-text">
          <span class="header-title">Proof of Work</span>
          <span class="header-subtitle">
            Track, verify, and manage all work activities efficiently
          </span>
        </div>
      </div>

      <v-spacer />
      <v-btn
        color="primary"
        size="small"
        class="text-capitalize mr-5"
        @click="back_action()"
        prepend-icon="mdi-step-backward"
        style="  background: linear-gradient(135deg, #dd4d78, #f06292);
 color: white !important"
      >
        Back
      </v-btn>

      <v-tooltip text="Take a screenshot and raise a ticket">
        <template #activator="{ props }">
          <v-icon v-bind="props" color="primary" @click="TakeScreenShot"
            >mdi-help-circle-outline</v-icon
          >
        </template>
      </v-tooltip>
    </v-app-bar>
    <div class="scroll-container">
      <v-tabs
        v-model="tabs"
        class="custom-tabs"
        bg-color="transparent"
        grow="false"
      >
        <v-tab value="settings" class="tab-btn">
          <v-icon start size="16">mdi-cog</v-icon>
          Settings
        </v-tab>

        <v-tab value="form" class="tab-btn" v-if="proofEnabled">
          <v-icon start size="16">mdi-form-select</v-icon>
          Form Design
        </v-tab>
      </v-tabs>

      <v-window v-model="tabs">
        <v-window-item value="settings">
          <div class="content-wrapper">
            <v-card class="settings-card">
              <v-card-text class="settings-content">
                <div class="left-section">
                  <div>
                    <div class="title-text">Proof of Work</div>
                    <div class="subtitle-text">
                      Enable or disable presence verification
                    </div>
                  </div>
                </div>

                <v-switch
                  v-model="proofEnabled"
                  color="#DD4D78"
                  inset
                  hide-details
                  @update:modelValue="enable_status"
                />
              </v-card-text>
            </v-card>

            <!-- ✅ CONFIG SECTION -->
            <div class="mt-6">
              <!-- 🟢 ENABLED STATE -->
              <v-card v-if="proofEnabled" class="config-card" style="width: 100%">
                <v-card-title class="config-header">
                  <v-icon color="primary" class="mr-2">mdi-cog</v-icon>
                  Proof of Work Configuration
                   <v-icon color="primary" @click="refresh_worktype">mdi-refresh</v-icon>

                  <v-btn
                    color="primary"
                    @click="create_worktype"
                    class="create-btn-modern"
                  >
                    <v-icon class="mr-2">mdi-plus</v-icon>
                    Add WorkType
                  </v-btn>
                </v-card-title>

                <v-divider />

                <v-card-text>
                  <v-row dense>
                    <v-col cols="5" class="add-btn mt-5"></v-col>
                  </v-row>
                </v-card-text>

                <!-- ✅ YOUR SAME TABLE (UNCHANGED) -->
                <v-data-table
                  :headers="headers"
                  :items="items"
                  :loading="loading"
                  class="modern-table bordered-table"
                  elevation="0"
                  height="250"
                  style="width: 80%; margin-left: 10%"
                  fixed-header
                >
                <template v-slot:loading>
                  <div class="text-center">
                    <v-progress-circular indeterminate color="primary" size="32" class="mt-6" />
                    <div class="text-subtitle-2 mt-4 text-grey">Loading WorkType</div>
                  </div>

                </template>
                  <!-- 🔁 KEEP ALL YOUR EXISTING SLOTS -->
                  <template #item.tagged_status="{ item }">
                    <div
                      v-if="item.tagged_status === 'UNTAGGED'"
                      class="tag-empty-center"
                    >
                      <v-tooltip
                        text="Click to tag form"
                        content-class="custom-tooltip"
                      >
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            class="tag-btn"
                            @click="Tagfile_dialog(item)"
                            icon
                          >
                            <v-icon size="18">mdi-plus</v-icon>
                          </v-btn>
                        </template>
                      </v-tooltip>
                    </div>
                    <div v-else class="tagged-container">
                      <v-tooltip
                        text="Click to untag form"
                        content-class="custom-tooltip"
                      >
                        <template #activator="{ props }">
                          <v-chip
                            v-bind="props"
                            class="tag-chip clickable-chip"
                            size="small"
                            label
                            @click="openUntagDialog(item)"
                          >
                            <v-icon start size="14"
                              >mdi-file-document-outline</v-icon
                            >
                            {{ getFormName(item.tagged_form_id) }}
                          </v-chip>
                        </template>
                      </v-tooltip>
                    </div>
                  </template>

                  <template #item.Actions="{ item }">
                    <v-icon
                      :color="
                        item.tagged_status === 'UNTAGGED' ? 'red' : 'grey'
                      "
                      :style="{
                        cursor:
                          item.tagged_status === 'UNTAGGED'
                            ? 'pointer'
                            : 'not-allowed',
                      }"
                      @click="
                        item.tagged_status === 'UNTAGGED' && DeleteDialog(item)
                      "
                    >
                      mdi-delete
                    </v-icon>
                  </template>
                </v-data-table>
              </v-card>

              <!-- 🔴 DISABLED STATE -->
              <v-card v-else class="empty-state-card">
                <v-card-text class="text-center pa-10">
                  <v-icon size="50" color="#dd4d78" class="mb-3">
                    mdi-toggle-switch-off-outline
                  </v-icon>

                  <div class="empty-title">Configuration Disabled</div>

                  <div class="empty-subtitle">
                    Enable Proof of Work to manage Work Types and Forms
                  </div>

                  <!-- 🔥 CTA BUTTON -->
                </v-card-text>
              </v-card>
            </div>
          </div>
        </v-window-item>
        <v-window-item value="form">
          <FormPage :worktypes="items" />
        </v-window-item>
      </v-window>
      <SnackBar :SnackBarComponent="SnackBarComponent" />
      <TagedForms
        :formtag="formtag"
        :selectedWorktype="selectedWorktype"
        :mode="dialogMode"
        :items="items"
        @close="formtag = false"
        @tag-success="fetch_powlist()"
        @successMsg="success_info"
        @errorMsg="error_info"
      />
      <CreateWorktype
        :worktypecreate="worktypecreate"
        @close="worktypecreate = false"
        @successMsg="success_info"
        @errorMsg="error_info"
        @navigateToForms="goToFormTagging"
      />
      <DeleteWorkType
        :WorkDelete="WorkDelete"
        :deletedata="deletedata"
        @close="WorkDelete = false"
        @successMsg="success_info"
        @errorMsg="error_info"
      />
    </div>
  </div>
</template>
<script>
import { Form_List } from "@/mixins/AllWorktpeForms";
import html2canvas from "html2canvas";
import CreateWorktype from "@/components/PresenceApp/PopUps/CreateWorktype.vue";
import CreateExternalTicketDialog from "@/components/Tickets/CreateExternalTicketDialog.vue";
import FormPage from "@/components/PresenceApp/PopUps/FormPage.vue";
import { attendence_report_configuration } from "@/graphql/mutations.js";
import { get_worktypes } from "@/graphql/queries.js";
import TagedForms from "@/components/PresenceApp/PopUps/TagedForms.vue";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
import DeleteWorkType from "@/components/PresenceApp/PopUps/DeleteWorkType.vue";

export default {
  components: {
    CreateExternalTicketDialog,
    FormPage,
    TagedForms,
    SnackBar,
    CreateWorktype,
    DeleteWorkType,
  },
  mixins: [Form_List],
  data() {
    return {
      SnackBarComponent: {},
      WorkDelete: false,
      items: [],
      workType: "",
      formtag: false,
      attachmentSource: null,
      tabs: "settings",
      proofEnabled: null,
      DialogCreateExternalTicket: false,
      ScreenshotFile: null,
      loading: false,
      worktypecreate: false,
      selectedWorktype: null,
      deletedata: {},
      dialogMode: "TAG",
      headers: [
        { title: "Work Type", value: "worktype_name", align: "start" },
        { title: "Tagged Form", value: "tagged_status", align: "center" },
        { title: "Actions", value: "Actions", align: "end" },
      ],
    };
  },
  watch: {
    "$route.query.tab": {
      immediate: true,
      handler(val) {
        if (val) {
          this.$store.commit("SET_ACTIVE_TAB", val);
        }
      },
    },

  
  },
  mounted() {
    this.fetch_powlist();
    this.fetchForms();
    const saved = localStorage.getItem("proofEnabled");
    if (saved !== null) {
      this.proofEnabled = saved === "true";
    }
    const tab = this.$route.query.tab;
    if (tab) {
      this.$store.commit("SET_ACTIVE_TAB", tab);
    }
  },
  computed: {
    tabs: {
      get() {
        return this.$store.state.activeTab || "settings";
      },
      set(val) {
        this.$store.commit("SET_ACTIVE_TAB", val);
      },
    },
  },
    methods: {
      refresh_worktype() {
        this.fetch_powlist();
      },
      Tagfile_dialog(item) {
        this.selectedWorktype = item;
        this.dialogMode = "TAG";
        this.formtag = true;
      },

    openUntagDialog(item) {
      this.selectedWorktype = item;
      this.dialogMode = "UNTAG";
      this.formtag = true;
    },
    getFormName(formId) {
      if (!this.formList) return "Tagged";

      const form = this.formList.find((f) => f.worktype_form_id === formId);

      return form ? form.worktype_form_name : "Tagged";
    },
    async enable_status() {
      // ✅ SAVE LOCALLY
      localStorage.setItem("proofEnabled", this.proofEnabled);

      try {
        const response = await API.graphql(
          graphqlOperation(attendence_report_configuration, {
            input: {
              is_proof_of_work_enabled: this.proofEnabled,
            },
          }),
        );

        const result = JSON.parse(
          response.data.attendence_report_configuration,
        );

        if (result.Status === "SUCCESS") {
          // optional snackbar
        }
      } catch (e) {
        console.log("error", e);
      }
    },

      async fetch_powlist() {
        this.loading = true;
        try {
          const result = await API.graphql(
            graphqlOperation(get_worktypes, {
              input: {},
            }),
          );
          const response = JSON.parse(result.data.get_worktypes);
          if (response.Status === "SUCCESS") {
            this.items = response.worktypes;
          } else {
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "red",
              SnackbarText: val,
              timeout: 5000,
              Top: true,
            };
          }
        } catch (e) {
          console.log("error", e);
        } finally {
          this.loading = false;
        }
      },
      success_info(msg) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "green",
          SnackbarText: msg,
          timeout: 8000,
          Top: true,
        };
        this.worktypecreate = false;
        this.fetch_powlist();
      },
      error_info(msg) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          Snackbarcolor: "red",
          SnackbarText: msg,
          timeout: 4000,
          Top: true,
        };
      },
      back_action() {
        this.$store.commit("SetattendenceBack", true);
        this.$router.push("/home/UserLevel");
      },

    create_worktype() {
      this.worktypecreate = true;
    },
    async TakeScreenShot() {
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

    handleTagForm(payload) {
      console.log("Tagging:", payload);
      this.fetch_powlist();
    },
    DeleteDialog(item) {
      this.WorkDelete = true;
      this.deletedata = item;
      console.log("delete", this.deletedata);
    },
  },
}
</script>
<style scoped>
:deep(.custom-tooltip) {
  background: linear-gradient(135deg, #fdf2f8, #eef2ff) !important;
  color: #be185d !important;
  font-weight: 500;
  border-radius: 8px;
  padding: 6px 12px;
  box-shadow: 0 4px 12px rgba(221, 77, 120, 0.3);
}
.pow-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.modern-header-section {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 24px;
  height: 70px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-icon-bg {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #014e95;
  box-shadow: 0 4px 10px rgba(221, 77, 120, 0.3);
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.header-subtitle {
  font-size: 13px;
  color: #6b7280;
}

.help-btn {
  background: #f3f4f6;
  transition: all 0.2s ease;
}

.help-btn:hover {
  background: #ffe4ec;
  color: #dd4d78;
}

.content-wrapper {
  padding: 24px;
}

.settings-card {
  max-width: 500px;
  border-radius: 16px;
  padding: 4px;

  background: white;
  border: 1px solid #f3f4f6;

  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05), 0 4px 10px rgba(0, 0, 0, 0.04);

  transition: all 0.3s ease;
}

.settings-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.08), 0 6px 14px rgba(0, 0, 0, 0.05);
}

.settings-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-box {
  background: linear-gradient(135deg, #dd4d78, #f06292);
  width: 40px;
  height: 40px;
  border-radius: 12px;

  display: flex;
  align-items: center;
  justify-content: center;

  box-shadow: 0 4px 10px rgba(221, 77, 120, 0.25);
}
.scroll-container {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding-bottom: 20px;
  scroll-behavior: smooth;
}
.title-text {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.subtitle-text {
  font-size: 13px;
  color: #6b7280;
}
.custom-input {
  max-width: 300px;
}

  .custom-input :deep(.v-field) {
    border-radius: 10px !important;
    background: #fafafa;
    border: 1px solid #e5e7eb;
    transition: all 0.2s ease;
  }
  .config-card {
    border-radius: 16px;
    border: 1px solid #f3f4f6;
    background: white;

    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05), 0 4px 10px rgba(0, 0, 0, 0.04);
  }

.config-header {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
  margin-left: -20%;
}

.custom-input :deep(.v-field) {
  border-radius: 10px !important;
}

.radio-group {
  margin-top: -4px;
  margin-left: -22%;
}
.add-btn {
  justify-content: end;
  display: flex;
  margin-left: 35%;
  margin-top: -6%;
}
.custom-tabs {
  display: inline-flex;
  align-items: center;

  background: #f6f7fb;
  padding: 6px;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 5;
  background: #f6f7fb;
  margin: 12px 24px;
  gap: 6px;

  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* TAB */
.custom-tabs :deep(.v-tab) {
  text-transform: none;
  font-size: 13px;
  font-weight: 500;

  min-width: auto;
  height: 36px; /* ✅ FIXED HEIGHT */
  padding: 0 18px;

  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  color: #4b5563;
  transition: all 0.25s ease;
}

/* ICON */
.custom-tabs :deep(.v-icon) {
  font-size: 16px;
}

/* HOVER */
.custom-tabs :deep(.v-tab:hover) {
  background: #fce7f3; /* light pink hover */
  color: #db2777;
}

/* ACTIVE (SELECTED TAB) */
.custom-tabs :deep(.v-tab.v-tab--selected) {
  background: #ec4899 !important; /* ✅ SOLID PINK */
  color: white !important;

  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(236, 72, 153, 0.3);
}
/* REMOVE DEFAULT LINE */
.custom-tabs :deep(.v-tab::after) {
  display: none;
}
.create-btn {
  margin-left: 60%;
}
.blur-card {
  filter: blur(4px);
  opacity: 0.6;
  pointer-events: none;
  user-select: none;
}
.tag-empty {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #9ca3af;
  font-size: 12px;
}

/* PLUS BUTTON */
.tag-btn {
  background: linear-gradient(135deg, #dd4d78, #f06292);
  color: white;
  box-shadow: 0 4px 10px rgba(221, 77, 120, 0.3);
  transition: all 0.2s ease;
}

.tag-btn:hover {
  transform: scale(1.1);
}

/* TAGGED STATE */
.tagged-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* CHIP BASE */
.tag-chip {
  background: #f3f4f6;
  font-weight: 500;
  border-radius: 10px;
  padding: 4px 10px;
  transition: all 0.25s ease;
}

/* CLICKABLE CHIP */
.clickable-chip {
  cursor: pointer;
}

/* HOVER EFFECT */
.clickable-chip:hover {
  background: linear-gradient(135deg, #dd4d78, #f06292);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(221, 77, 120, 0.3);
}

/* ICON COLOR CHANGE ON HOVER */
.clickable-chip:hover .v-icon {
  color: white !important;
}
.tagged-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* CHIP BASE */
.tag-chip {
  background: #f3f4f6;
  font-weight: 500;
  border-radius: 10px;
  padding: 4px 10px;
  transition: all 0.25s ease;
}

/* CLICKABLE CHIP */
.clickable-chip {
  cursor: pointer;
}

/* HOVER EFFECT */
.clickable-chip:hover {
  background: linear-gradient(135deg, #dd4d78, #f06292);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(221, 77, 120, 0.3);
}

.clickable-chip:hover .v-icon {
  color: white !important;
}

/* UNTAG ICON */
.untag-icon {
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s ease;
}

.untag-icon:hover {
  transform: scale(1.2);
  color: #dc2626;
}
/* PERFECT CENTER ALIGNMENT */
.tag-empty-center {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

/* FIX BUTTON SIZE */
.tag-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dd4d78, #f06292);
  color: white;
  box-shadow: 0 6px 14px rgba(221, 77, 120, 0.35);
  transition: all 0.25s ease;
}

/* HOVER EFFECT */
.tag-btn:hover {
  transform: scale(1.15);
}
.modern-table {
  margin-top: -2%;
  border-radius: 12px;
  overflow: hidden;
}
.create-btn-modern {
  margin-left: 60%;
  background: linear-gradient(135deg, #dd4d78, #f06292);
  color: white;
  border-radius: 10px;
  padding: 6px 14px;
  font-weight: 500;
  box-shadow: 0 6px 16px rgba(221, 77, 120, 0.3);
}
.bordered-table {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

/* HEADER */
.bordered-table :deep(.v-data-table__thead) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #f9fafb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.bordered-table :deep(th) {
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
}

/* ROWS */
.bordered-table :deep(td) {
  border-bottom: 1px solid #f1f5f9;
}

/* LAST ROW FIX */
.bordered-table :deep(tr:last-child td) {
  border-bottom: none;
}

/* OPTIONAL: COLUMN SEPARATORS */
.bordered-table :deep(td:not(:last-child)),
.bordered-table :deep(th:not(:last-child)) {
  border-right: 1px solid #f1f5f9;
}
.empty-state-card {
  border-radius: 16px;
  border: 1px dashed #f3d1dc;
  background: linear-gradient(135deg, #fdf2f8, #eef2ff);
  text-align: center;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: #be185d;
}

.empty-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin-top: 6px;
}

.enable-btn {
  background: linear-gradient(135deg, #fdf2f8, #eef2ff);
  color: white;
  border-radius: 10px;
  padding: 6px 16px;
}
</style>
