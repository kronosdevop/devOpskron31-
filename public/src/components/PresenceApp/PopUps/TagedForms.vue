<template>
  <v-dialog :model-value="formtag" width="500" persistent>

    <!-- 🔵 TAG MODE -->
    <v-card v-if="mode === 'TAG'" class="pa-2 rounded-xl">

      <!-- HEADER -->
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-tag-outline</v-icon>
          <span class="text-h6 font-weight-bold">Tag Form</span>
        </div>
        <v-btn icon variant="text" @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider class="mb-3" />

      <!-- CONTENT -->
      <v-card-text>

        <div class="text-subtitle-2 mb-2 text-grey">
          Select a form to tag with this worktype
        </div>

        <v-select
          v-model="selectform"
          :items="mappedForms"
          item-title="title"
          item-value="value"
          label="Choose Form"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-file-document-outline"
          class="modern-input"
        />

      </v-card-text>

      <!-- ACTIONS -->
      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="closeDialog">Cancel</v-btn>

        <v-btn
          color="primary"
          class="text-capitalize"
          @click="tag_forms"
          :disabled="!selectform || loading"
          :loading="loading"
        >
          <v-icon start size="18">mdi-tag</v-icon>
          Tag Form
        </v-btn>
      </v-card-actions>

    </v-card>


    <!-- 🔴 UNTAG MODE -->
    <v-card v-else class="pa-2 rounded-xl">

      <!-- HEADER -->
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon color="red" class="mr-2">mdi-tag-off-outline</v-icon>
          <span class="text-h6 font-weight-bold">Untag Form</span>
        </div>
        <v-btn icon variant="text" @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider class="mb-3" />

      <!-- CONTENT -->
      <v-card-text class="text-center">

        <v-icon size="48" color="red" class="mb-2">
          mdi-alert-circle-outline
        </v-icon>

        <div class="text-subtitle-1 font-weight-medium mb-1">
          Remove Tagged Form?
        </div>

        <div class="text-grey text-body-2">
          This will untag the form from this worktype.
        </div>

      </v-card-text>

      <!-- ACTIONS -->
      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="closeDialog">Cancel</v-btn>

        <v-btn
          color="red"
          class="text-capitalize"
          @click="untag_forms"
          :loading="loading"
        >
          <v-icon start size="18">mdi-tag-off</v-icon>
          Untag
        </v-btn>
      </v-card-actions>

    </v-card>

  </v-dialog>
</template>

<script>
import { API, graphqlOperation } from "aws-amplify";
import { tag_worktype } from "@/graphql/mutations.js";
import {Form_List} from "@/mixins/AllWorktpeForms";
export default{
    mixins : [Form_List],
    props:{
        formtag : Boolean,
        selectedWorktype: Object,
        mode: String ,
          items: Array
       
    },
    data(){
        return{
               selectform:"",
               forms:[],
               loading : false
        }
    },
computed: {
  mappedForms() {
    if (!this.formList || !this.items) return [];

    // 👉 all tagged form ids
    const taggedFormIds = this.items
      .map(i => i.tagged_form_id)
      .filter(id => id);

    // 👉 filter available forms
    return this.formList
      .filter(form => !taggedFormIds.includes(form.worktype_form_id))
      .map(form => ({
        title: form.worktype_form_name,
        value: form.worktype_form_id
      }));
  }
},
watch: {
  selectform(val) {
    console.log("Selected form_id:", val);
  },
    formtag(val) {
    if (val) {
      this.fetchForms();
    }
  }
},
mounted() {
  this.fetchForms();   
},
    methods:{
        closeDialog(){
            this.$emit("close",0)
        },
    async untag_forms() {
  try {
     this.loading = true;
    const result = await API.graphql(
      graphqlOperation(tag_worktype, {
        input: {
          worktype_id: this.selectedWorktype.worktype_id,
          form_id: null,
          action: "UNTAG",
        },
      })
    );

    const response = JSON.parse(result.data.tag_worktype);

    if (response.Status === "SUCCESS") {
        await this.fetchForms();
      this.$emit("tag-success");
      this.$emit("successMsg", "Form untagged successfully ✅");
      this.closeDialog();
    }

  } catch (e) {
    this.$emit("errorMsg", "Untag failed ❌");
    console.log("Untag error", e);
  }
  finally{
     this.loading = false;
  }
},
    
async tag_forms() {

  if (this.selectedWorktype?.tagged_status === "TAGGED") {
    this.$emit("errorMsg", "This worktype already has a form. Please untag first.");
    return;
  }

  this.loading = true;

  try {
    const result = await API.graphql(
      graphqlOperation(tag_worktype, {
        input: {
          worktype_id: this.selectedWorktype.worktype_id,
          form_id: this.selectform,
          action: "TAG",
        },
      })
    );

    const response = JSON.parse(result.data.tag_worktype);

    if (response.Status === "SUCCESS") {
      await this.fetchForms();
      this.$emit("tag-success");
      this.$emit("successMsg", "Form tagged successfully ✅");
      this.closeDialog();
      this.selectform = ""
    }

  } catch (e) {
    this.$emit("errorMsg", "Tagging failed ❌");
    console.log("Tag error", e);
  } finally {
    this.loading = false;
  }
},

    
  },
    
}
</script>