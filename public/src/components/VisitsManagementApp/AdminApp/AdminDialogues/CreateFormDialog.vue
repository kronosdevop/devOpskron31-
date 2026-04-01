<!-- <template>
  <div>
    <v-dialog
      :model-value="createFormDialogue"
      @update:model-value="$emit('update:createFormDialogue', $event)"
      persistent
      fullscreen
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" density="compact" class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Create Visit Type</div>
          </v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="close_dialog()">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <div v-if="stepperflow === 1">
          <v-card
            variant="solo"
            height="270"  
            elevation="5"
            class="ml-4"
          >
            <v-card-text>
              <v-form ref="form">
                <v-row no-gutters class="mt-1">
                  <v-col cols="6" md="6">
                    <v-text-field
                      density="compact"
                      v-model="visitName"
                      label="Name*"
                      :rules="[(v) => !!v || 'required']"
                      variant="outlined"
                      style="max-width: 300px"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6" md="6">
                    <v-autocomplete
                      density="compact"
                      v-model="visitFrequency"
                      label="Visit Frequency"
                      :rules="[(v) => !!v || 'required']"
                      variant="outlined"
                      :items="[
                        'Daily',
                        'Once in one week',
                        'Once in two weeks',
                        'Monthly',
                        'Quarterly',
                        'Once a year',
                      ]"
                      v-model:search="searchF"
                      hide-no-data
                      style="max-width: 300px"
                    ></v-autocomplete>
                  </v-col>
                  <v-col cols="6" md="6">
                    <v-radio-group
                      class="mt-n1"
                      label="Visit Type"
                      v-model="visitTypeAction"
                      :rules="[(v) => !!v || 'required']"
                      row
                    >
                      <v-radio label="Physical" value="PHYSICAL"></v-radio>
                      <v-radio label="Virtual" value="VIRTUAL"></v-radio>
                    </v-radio-group>
                  </v-col>
                  <v-col cols="6" md="6">
                    <v-radio-group
                      class="mt-n1"
                      label="Adhoc Approval Required"
                      v-model="adhocapproval"
                      :rules="[(v) => !!v || 'required']"
                      row
                    >
                      <v-radio label="Yes" value="YES"></v-radio>
                      <v-radio label="No" value="NO"></v-radio>
                    </v-radio-group>
                  </v-col>
                  <v-col cols="6" md="6">
                    <v-text-field
                      style="max-width: 300px"
                      density="compact"
                      v-if="visitTypeAction === 'PHYSICAL'"
                      v-model="scanTolerance"
                      label="Scan Tolerance"
                      variant="outlined"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6" md="6">
                    <v-btn
                      class="text-capitalize text-white"
                      color="primary"
                      variant="flat"
                      @click="nextstep()"
                      v-show="visitTypeAction"
                    >
                      Continue
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>
        </div>
        <div v-if="stepperflow === 2">
          <v-card variant="outlined" density="compact">
            <v-btn
              class="text-capitalize cardCss mb-n4 ml-4"
              color="primary"
              @click="stepperflow = 1"
            >
              Previous
            </v-btn>
            <AdminFormDesigner
              :key="componentCheck"
              @errorMsg="error_info"
              @successMsg="success_info"
            />
          </v-card>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import AdminFormDesigner from "@/components/FormDesigner/AdminFormDesigner.vue";

export default {
  name: "CreateVisitTypeDialog",
  components: {
    AdminFormDesigner,
  },
  props: {
    createFormDialogue: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      formFields: [],
      previewCheck: 0,
      componentCheck: 0,
      previewDialog: false,
      adhocapproval: "YES",
      stepperflow: 1,
      cardHeight: 0,
      visitName: "",
      visitFrequency: "",
      userArray: [],
      searchF: "",
      visitTypeAction: null,
      scanTolerance: 0,
    };
  },
  watch: {
    createFormDialogue: {
      handler(newVal) {
        if (newVal) {
          this.visitName = "";
          this.visitFrequency = "";
          this.visitTypeAction = "PHYSICAL";
          this.scanTolerance = 0;
          this.stepperflow = 1;
          this.componentCheck += 1;
          this.$store.commit("Setvisitdetails", {});
        }
      },
      immediate: true,
    },
  },
  methods: {
    error_info(val) {
      this.$emit("errorMsg", val);
    },
    success_info(val) {
      this.$emit("successMsg", val);
      this.$emit("formupdate", 0);
    },
    nextstep() {
      if (this.$refs.form.validate()) {
        const data = {
          visit_type_name: this.visitName,
          visit_type_frequency: this.visitFrequency,
          visit_type_representation: this.visitTypeAction,
          scan_tolerance:
            this.visitTypeAction === "VIRTUAL" ? 0 : this.scanTolerance,
          adhock_approval_required: this.adhocapproval === "YES",
        };
        this.$store.commit("Setvisitdetails", data);
        this.stepperflow = 2;
      }
    },
    close_dialog() {
      this.visitName = "";
      this.visitFrequency = "";
      this.visitTypeAction = null;
      this.stepperflow = 1;
      this.$store.commit("SetVisitorFormEnabled", false);
      this.$store.commit("SetVisitorFormEdit", false);
      this.$emit("clicked", 0);
    },
  },
};
</script>

<style scoped>
.navBar {
  background-color: #f5f5f5;
}
.text--black {
  color: black !important;
}
.custom-title {
  font-weight: 500;
}
</style> -->

<template>
  <div>
    <v-dialog
      :model-value="createFormDialogue"
      @update:model-value="$emit('update:createFormDialogue', $event)"
      persistent
      transition="dialog-top-transition"
      fullscreen
    >
      <v-container>
        <v-card>
          <v-toolbar elevation="0" density="compact" class="navBar">
            <v-toolbar-title class="text--black">
              <div class="custom-title">Create Visit Type</div>
            </v-toolbar-title>
            <v-spacer />
            <v-btn icon @click="close_dialog()">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>
          <div v-if="stepperflow === 1">
            <v-card variant="solo" elevation="5">
              <v-card-text>
                <v-form ref="form">
                  <v-row no-gutters class="mt-1">
                    <v-col cols="6" md="6">
                      <v-text-field
                        density="compact"
                        v-model="visitName"
                        label="Name*"
                        :rules="[(v) => !!v || 'required']"
                        variant="outlined"
                        style="max-width: 300px"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6" md="6">
                      <v-autocomplete
                        density="compact"
                        v-model="visitFrequency"
                        label="Visit Frequency"
                        :rules="[(v) => !!v || 'required']"
                        variant="outlined"
                        :items="[
                          'Daily',
                          'Once in one week',
                          'Once in two weeks',
                          'Monthly',
                          'Quarterly',
                          'Once a year',
                        ]"
                        v-model:search="searchF"
                        hide-no-data
                        style="max-width: 300px"
                      ></v-autocomplete>
                    </v-col>
                    <v-col cols="6" md="6">
                      <v-radio-group
                        class="mt-n1"
                        label="Visit Type"
                        v-model="visitTypeAction"
                        :rules="[(v) => !!v || 'required']"
                        row
                      >
                        <v-radio label="Physical" value="PHYSICAL"></v-radio>
                        <v-radio label="Virtual" value="VIRTUAL"></v-radio>
                      </v-radio-group>
                    </v-col>
                    <v-col cols="6" md="6">
                      <v-radio-group
                        class="mt-n1"
                        label="Adhoc Approval Required"
                        v-model="adhocapproval"
                        :rules="[(v) => !!v || 'required']"
                        row
                      >
                        <v-radio label="Yes" value="YES"></v-radio>
                        <v-radio label="No" value="NO"></v-radio>
                      </v-radio-group>
                    </v-col>
                    <v-col cols="6" md="6">
                      <v-text-field
                        style="max-width: 300px"
                        density="compact"
                        v-if="visitTypeAction === 'PHYSICAL'"
                        v-model="scanTolerance"
                        label="Scan Tolerance"
                        variant="outlined"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6" md="6">
                      <v-btn
                        class="text-capitalize text-white"
                        color="primary"
                        variant="flat"
                        @click="nextstep()"
                        v-show="visitTypeAction"
                      >
                        Continue
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>
            </v-card>
          </div>
          <div v-if="stepperflow === 2">
            <v-card density="compact">
              <v-btn
                class="text-capitalize cardCss mb-n4 ml-4"
                color="primary"
                @click="stepperflow = 1"
              >
                Previous
              </v-btn>
              <AdminFormDesigner
                :key="componentCheck"
                @errorMsg="error_info"
                @successMsg="success_info"
              />
            </v-card>
          </div>
        </v-card>
      </v-container>
    </v-dialog>
  </div>
</template>

<script>
import AdminFormDesigner from "@/components/FormDesigner/AdminFormDesigner.vue";

export default {
  name: "CreateVisitTypeDialog",
  components: {
    AdminFormDesigner,
  },
  props: {
    createFormDialogue: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      formFields: [],
      previewCheck: 0,
      componentCheck: 0,
      previewDialog: false,
      adhocapproval: "YES",
      stepperflow: 1,
      cardHeight: 0,
      visitName: "",
      visitFrequency: "",
      userArray: [],
      searchF: "",
      visitTypeAction: null,
      scanTolerance: 0,
    };
  },
  watch: {
    createFormDialogue: {
      handler(newVal) {
        if (newVal) {
          this.visitName = "";
          this.visitFrequency = "";
          this.visitTypeAction = "PHYSICAL";
          this.scanTolerance = 0;
          this.stepperflow = 1;
          this.componentCheck += 1;
          this.$store.commit("Setvisitdetails", {});
        }
      },
      immediate: true,
    },
  },
  methods: {
    error_info(val) {
      this.$emit("errorMsg", val);
    },
    success_info(val) {
      this.$emit("successMsg", val);
      this.$emit("formupdate", 0);
    },
    nextstep() {
      if (this.$refs.form.validate()) {
        const data = {
          visit_type_name: this.visitName,
          visit_type_frequency: this.visitFrequency,
          visit_type_representation: this.visitTypeAction,
          scan_tolerance:
            this.visitTypeAction === "VIRTUAL" ? 0 : this.scanTolerance,
          adhock_approval_required: this.adhocapproval === "YES",
        };
        this.$store.commit("Setvisitdetails", data);
        this.stepperflow = 2;
      }
    },
    close_dialog() {
      this.visitName = "";
      this.visitFrequency = "";
      this.visitTypeAction = null;
      this.stepperflow = 1;
      this.$store.commit("SetVisitorFormEnabled", false);
      this.$store.commit("SetVisitorFormEdit", false);
      this.$emit("clicked", 0);
    },
  },
};
</script>

<style scoped>
.navBar {
  background-color: #f5f5f5;
}
.text--black {
  color: black !important;
}
.custom-title {
  font-weight: 500;
}
</style>
