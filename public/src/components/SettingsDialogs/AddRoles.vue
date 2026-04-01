<template>
  <div>
    <!-- eslint-disable -->

    <v-dialog :model-value="addingRolesDialog" @update:model-value="$emit('update:addingRolesDialog', $event)" persistent max-width="600" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Add Role
              </div>
            </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text>
          <v-row no-gutters class="mt-4">
            <v-col cols="12">
              <v-text-field outlined dense label="Role" v-model="roleName" />
            </v-col>
            <!-- <v-col cols="12">
              <v-select
                outlined
                dense
                label="Select User"
                :items="['Anusha', 'Chandana', 'Jisha']"
              />
            </v-col> -->
            <v-col cols="12">
              <div>Map Role</div>
              <v-radio-group v-model="mapping" row>
                <v-radio label="Organization Level" value="orgLevel"></v-radio>
                <v-radio label="Group Level" value="groupLevel"></v-radio>
                <v-radio label="Location Level" value="groupLevel"></v-radio>
              </v-radio-group>
            </v-col>
            <!-- <v-col v-if="mapping == 'groupLevel'" cols="12">
              <v-select
                label="Select Group"
                v-model="groupName"
                dense
                outlined
                :items="['Mobil80', 'uMobi', 'Surecreds', 'WRKTOP']"
              />
            </v-col> -->
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            dark
            @click="close_dialog()"
            class="text-capitalize cardCss button-corner"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */

export default {
  props: {
    addingRolesDialog: Boolean,
  },
  data() {
    return {
      mapping: null,
      groupName: "",
      roleName: "",
    };
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
  },
};
</script>