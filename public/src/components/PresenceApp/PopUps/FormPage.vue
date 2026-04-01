<template>
  <div>
    <v-btn
      variant="flat"
      color="primary"
      class="create-btn-modern"
      rounded="xl"
      @click="create_form()"
      ><v-icon>mdi-plus</v-icon> Create Form</v-btn
    >
    <v-card class="mt-4">
      <v-card-title class="config-header"
        ><v-icon color="primary" class="mr-2">mdi-form-select</v-icon>
        Forms</v-card-title
      >
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="Formdata"
          :loading="loading"
          class="bordered-table mb-4"
        >
             <template v-slot:loading>
                  <div class="text-center">
                    <v-progress-circular indeterminate color="primary" size="32" class="mt-6" />
                    <div class="text-subtitle-2 mt-4 text-grey">Loading Forms</div>
                  </div>
                </template>
          <template v-slot:item.worktype_form_created_on="{ item }">
            {{ formatDate(item.worktype_form_created_on) }}
          </template>

  <template #item.Actions = {item}>
<v-menu>
  <template #activator="{props}">
    <v-btn   icon
  rounded="circle"
  variant="text"
  v-bind="props"><v-icon>mdi-dots-vertical</v-icon></v-btn>
  </template>
  <v-list>
    <v-list-item @click="Preview(item)"> 
      <v-list-item-title>
        <v-icon color="blue" size="20" class="mr-2">mdi-eye</v-icon> View Form
      </v-list-item-title>
    </v-list-item>
   <v-list-item @click="editForm(item)"> 
      <v-list-item-title>
        <v-icon color="green" size="20" class="mr-2">mdi-pencil</v-icon> Edit Form
      </v-list-item-title>
    </v-list-item>
   <v-list-item  @click="handleDelete(item)">
    <v-list-item-title>
      <v-icon  color="red" size="20" class="mr-2"
  :style="{
    cursor: isFormTagged(item.worktype_form_id)
      ? 'not-allowed'
      : 'pointer',
    opacity: isFormTagged(item.worktype_form_id) ? 0.5 : 1,
  }"> mdi-delete</v-icon> Delete Form
    </v-list-item-title>
   </v-list-item>
  </v-list>
</v-menu>
</template>
        
        </v-data-table>
      </v-card-text>
    </v-card>
    <CreateForm
      :formCreationpow="formCreationpow"
      @close="formCreationpow = false"
      @navigateto="handleNavigation"
      v-on:successMsg="success_info"
      v-on:navigateto="handleNavigation"
    />
    <FormPreview
      :Preivew="Preivew"
      @close="Preivew = false"
      :fields="previewFields"
      :Formdata="selectedForm"
    />
    <Deleteform
      :FormDelete="FormDelete"
      @close="FormDelete = false"
      :deletedata="deletedata"
      @successMsg="success_info"
      @errorMsg="error_info"
    />
  </div>
</template>
<script>
import CreateForm from "@/components/PresenceApp/PopUps/CreateForm";
import { API, graphqlOperation } from "aws-amplify";
import { list_worktype_forms } from "@/graphql/queries.js";
import FormPreview from "@/components/PresenceApp/PopUps/FormPreview.vue";
import Deleteform from "@/components/PresenceApp/PopUps/Deleteform.vue";
export default {
  components: {
    CreateForm,
    FormPreview,
    Deleteform,
  },
  props: {
    worktypes: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      // formCreationpow: false,
      Preivew: false,
      headers: [
        { title: "Form Name", value: "worktype_form_name" },
        { title: "Created-by", value: "worktype_form_created_by" },
        { title: "Created-on", value: "worktype_form_created_on" },
        { title: "Actions", value: "Actions" },
      ],
      Formdata: [],
      previewFields: [],
      loading: false,
      FormDelete: false,
      deletedata: {},
      selectedForm: null,
      FormIdentity :""
    };
  },
  mounted() {
    this.fetch_formlist();

  if (this.$store.state.openCreateForm) {
    this.formCreationpow = true;
  }
  },
 computed: {
  formCreationpow: {
    get() {
      return this.$store.state.openCreateForm;
    },
    set(val) {
      this.$store.commit("OPEN_CREATE_FORM", val);
    }
  }
},
  methods: {
    handleDelete(item) {
  if (this.isFormTagged(item.worktype_form_id)) {
    return;
  }

  this.deleteDialog(item);
},
    isFormTagged(formId) {
      return this.worktypes.some((wt) => wt.tagged_form_id === formId);
    },
editForm(item) {

  console.log("123458",item)
    this.FormIdentity = item;
  console.log("frormiden",this.FormIdentity)
  this.$store.commit("SetWorktypeFormId", this.FormIdentity );
  let template =
    item.worktype_form_type === "DEFAULT"
      ? item.worktype_form_design_template
      : item.worktype_form_template;

  if (typeof template === "string") {
    try {
      template = JSON.parse(template);
      
    } catch {
      template = [];
    }
  }

  template = Array.isArray(template) ? template : [];

  this.$store.commit("SetformLibrary", false);

  this.$store.commit("SetFormObj", {
    worktype_form_design_template: JSON.parse(JSON.stringify(template)),
    is_form_designed: true
  });

  this.$store.commit("SetFormName", item.worktype_form_name);
  this.FormIdentity = item;
  console.log("frormiden",this.FormIdentity)
  this.$store.commit("SetWorktypeFormId", this.FormIdentity );

  this.$router.push({ name: "PowForms" });
},
    deleteDialog(item) {
      // 🔍 check if form is tagged
      const isTagged = this.$parent?.items?.some(
        (wt) => wt.tagged_form_id === item.worktype_form_id,
      );

      this.deletedata = {
        ...item,
        isTagged,
      };

      this.FormDelete = true;
    },
    formatDate(date) {
      if (!date || date === 0) return "-";

      const d = new Date(date * 1000);

      if (isNaN(d.getTime())) return "-";

      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },
    async fetch_formlist() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(list_worktype_forms, {
            input: {},
          }),
        );
        const response = JSON.parse(result.data.list_worktype_forms);
        if (response.Status === "SUCCESS") {
          this.Formdata = response.worktype_forms;
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
    create_form() {
  this.$store.commit("OPEN_CREATE_FORM", true);
    },
    handleNavigation() {
      this.$router.push({
        name: "PowForms",
      });
    },
Preview(item) {
  const items = item;
  console.log("form fields",items)

  // ✅ FIX: choose correct template
  let template =
    item.worktype_form_type === "DEFAULT"
      ? item.worktype_form_design_template
      : item.worktype_form_template;

  // ✅ parse safely
  if (typeof template === "string") {
    try {
      template = JSON.parse(template);
    } catch {
      template = [];
    }
  }

  template = Array.isArray(template) ? template : [];

  // ✅ deep copy (already good)
  this.previewFields = JSON.parse(JSON.stringify(template));

  this.selectedForm = item;
  this.Preivew = true;
},
    navigate_flow(value) {
      console.log(value);

      var data = {
        FormEdit: false,
        FlowValue: {
          form_id: value.form_id,
          form_name: this.formName,
        },
      };

      setTimeout(() => {
        this.$store.commit("SetformLibrary", false);

        this.$store.commit("SetFormObj", {
          form_id: value.form_id,
          form_design_template: [], // ✅ prevents crash
          is_form_designed: false,
        });

        this.$store.commit("Setpathinfo", "Admin");
        this.$store.commit("SetEditFormDetails", data);
        this.$store.commit("SetFormType", "CUSTOM");
        this.$store.commit("SetDirectoryForm", false);

        this.$router.push("/home/PowForms");
      }, 500);
    },
    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 8000,
        Top: true,
      };
      this.fetch_formlist(); //   this.editFormDialog = false;
      //   this.formDeployed = false;
      //   this.editVisibilityDialog = false;
      //   this.deleteForm = false;
      //   this.get_formlist();
      // this.get_all_flows();
    },
  },
};
</script>
<style scoped>
.config-header {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.newform {
  margin-left: 86%;
}
.bordered-table {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

/* HEADER */
.bordered-table :deep(.v-data-table__thead) {
  background: #f9fafb;
}

.bordered-table :deep(th) {
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
}

/* ROWS */
.bordered-table :deep(td) {
  border-bottom: 1px solid #f1f5f9;
}

/* REMOVE LAST ROW BORDER */
.bordered-table :deep(tr:last-child td) {
  border-bottom: none;
}

/* COLUMN SEPARATORS */
.bordered-table :deep(th:not(:last-child)),
.bordered-table :deep(td:not(:last-child)) {
  border-right: 1px solid #f1f5f9;
}
.create-btn-modern {
    margin-left: 60%;
    background: linear-gradient(135deg, #dd4d78, #f06292);
    color: white;
    border-radius: 10px;
    padding: 6px 14px;
    font-weight: 500;
    margin-left: 87%;
    box-shadow: 0 6px 16px rgba(221, 77, 120, 0.3);
  }
</style>
