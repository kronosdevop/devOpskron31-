<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="formCreationpow"
      @update:model-value="$emit('update:formCreationDialog', $event)"
      persistent
      max-width="500"
      transition="dialog-top-transition"
    >
      <v-card rounded="xl">
        <v-toolbar elevation="0" class="dialog-header">
          <v-toolbar-title class="dialog-title"><v-icon size="22" color="primary">mdi-form-select</v-icon> Create Form </v-toolbar-title>
          <v-spacer />
          <v-btn icon variant="text" @click="close_dialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-divider></v-divider>
        <v-card-text v-if="customForm == true" class="mt-4">
          <v-row no-gutters>
            <v-col cols="6">
              <v-card class="modern-tile" @click="form_library()">
                <div class="tile-content">
                  <div class="tile-icon">
                    <v-icon color="white">mdi-form-select</v-icon>
                  </div>

                  <div>
                    <div class="tile-title">Form Library</div>
                    <div class="tile-subtitle">
                      Use pre-built forms from library
                    </div>
                  </div>
                </div>
              </v-card>
            </v-col>

            <v-col cols="6">
              <v-card class="modern-tile ml-2" @click="get_custom()">
                <div class="tile-content">
                  <div class="tile-icon">
                    <v-icon color="white">mdi-note-edit-outline</v-icon>
                  </div>

                  <div>
                    <div class="tile-title">Custom Form</div>
                    <div class="tile-subtitle">Create your own form design</div>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-text class="mt-4">
          <v-form v-if="customForm == false" ref="form">
            <v-row no-gutters>
              <v-col cols="12">
                <v-text-field
                  density="compact"
                  variant="outlined"
                  :rules="[(v) => !!v || 'Required']"
                  label="Form Name"
                  v-model="formName"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="description"
                  variant="outlined"
                  v-model="formDesc"
                  @input="isDescriptionEdited = true"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions v-if="customForm == false" class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="validate_data()"
            dark
            class="cardCss button-corner text-capitalize text-white"
          >
            Next
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/*eslint-disable */
import { Worktype_list } from "@/mixins/AllWorkType.js";
import { create_worktype } from "@/graphql/mutations.js";
import { custom_form_creation } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { Handler } from "leaflet";
export default {
  props: {
    formCreationpow: Boolean,
    formDataArray: Array,
    actiontype: String,
  },
  mixins: [Worktype_list],
  data() {
    return {
      formName: "",
      formDesc: "",
      loading: false,
      customForm: false,
      formLibrayCheck: false,
      responseData: {},
      selected_worktype: [],
      isDescriptionEdited: false,
      worktypeFormId: null,
    };
  },

  watch: {
    formCreationpow: {
      async handler() {
        await this.Worktype_list();
        this.selected_worktype = this.worktypeList;
        console.log("selected_worktype", this.selected_worktype);
      },
      immediate: true,
    },
    formName(val) {
      if (!this.isDescriptionEdited) {
        this.formDesc = val;
      }
    },
  },

  methods: {
    close_dialog() {
      //   this.$store.commit("SetformLibrary", false);
      //   this.$store.commit("SetDirectoryForm", false);
      this.$emit("close", 0);
      this.customForm = false;
    },

    async validate_data() {
      const { valid } = await this.$refs.form.validate();

      if (valid) {
        this.$store.commit("SetFormName", this.formName);
        this.$store.commit("SetVisitorFormEnabled", false);
        this.$store.commit("SetVisitorFormEdit", false);
        this.$store.commit("SetCustomFormDesign", true);
        await this.next_click();
      }
    },

    async next_click() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
    

      const name = this.formName;

  console.log("formname", name);

  this.$store.commit("SetFormName", name);

      try {
        const result = await API.graphql(
          graphqlOperation(create_worktype, {
            input: {
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              worktype_form_name: this.formName,
              worktype_form_description: this.formDesc,
            },
          }),
        );
        const response = JSON.parse(result.data.create_worktype);
        if (response.Status == "SUCCESS") {
          this.isDescriptionEdited = false;
          this.responseData = response;
          this.$store.commit("SetWorktypeFormId", this.responseData);

          // this.worktypeFormId = response.worktype_form_id;
          this.customForm = true;
        } else {
        }
      } catch (error) {
        console.log("error", error);
      } finally {
        this.loading = false;
      }
    },
    get_custom() {
      this.$store.commit("SetformLibrary", false);

      this.$store.commit("SetFormObj", {
        form_design_template: [],
        is_form_designed: false,
      });

      const name = this.formName;

      this.$store.commit("SetFormName", name);

      console.log("filename", name);
  this.$emit("close");

      this.$emit("navigateto", {});

  
    },

    fetch_form_name(val) {
      this.formDesc = val;
    },

    form_library() {
      this.$store.commit("Setlibraryformtype", "FORM_LIBRARY");
      this.$store.commit("SetformLibrary", true);
      this.$store.commit("SetFormType", "FORMS_LIBRARY");
      this.$store.commit("SetDirectoryForm", false);
      this.$store.commit("SetExternalForm", false);
      this.$store.commit("SetFormObj", {
        form_design_template: [],
        is_form_designed: false,
      });
      this.$router.push("/home/PowForms");
      this.formLibrayCheck = true;
    },
  },
};
</script>
<style scoped>
.modern-tile {
  border-radius: 18px;
  padding: 18px;
  cursor: pointer;
  height: 120px;

  /* 🔥 EXACT BACKGROUND LIKE YOUR IMAGE */
  background: linear-gradient(135deg, #fdf2f8, #eef2ff);

  /* 🔥 SOFT PINK BORDER */
  border: 1px solid #f9a8d4;

  transition: all 0.3s ease;
}

.modern-tile:hover {
  transform: translateY(-4px);

  box-shadow: 0 10px 30px rgba(221, 77, 120, 0.25);

  background: linear-gradient(135deg, #fbcfe8, #e0e7ff);
}

.tile-content {
  display: flex;
  align-items: center;
  gap: 14px;
}

.tile-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;

  display: flex;
  align-items: center;
  justify-content: center;

  /* 🔥 SAME PINK GRADIENT ICON BOX */
  background: linear-gradient(135deg, #dd4d78, #c026d3);

  box-shadow: 0 6px 16px rgba(221, 77, 120, 0.4);
}
.tile-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.tile-subtitle {
  font-size: 12px;
  color: #6b7280;
}
.dialog-header {
  background: white;
  border-bottom: 1px solid #f1f5f9;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

</style>
