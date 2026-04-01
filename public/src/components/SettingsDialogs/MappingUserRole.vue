<template>
  <div>
    <!-- eslint-disable -->

    <v-dialog :model-value="mappingRolesDialog" @update:model-value="$emit('update:mappingRolesDialog', $event)" persistent max-width="600" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">
            Add Role
          </div></v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text>
          <v-row no-gutters class="mt-4">
            <v-col cols="12">
              <v-select
                outlined
                dense
                v-model="rolesList"
                label="Select Roles"
                :items="[
                  { text: 'CEO', value: 'Org' },
                  { text: 'Group Head', value: 'group' },
                ]"
                item-text="text"
                item-value="value"
                return-object
              />
            </v-col>
            <v-col v-if="rolesList != ''" cols="12">
              {{
                rolesList.text +
                " " +
                " Role mapped at " +
                rolesList.value +
                "Level"
              }}
            </v-col>
            <v-col v-if="rolesList.value == 'group'" cols="12">
              <v-select
                outlined
                dense
                label="Select Group"
                :items="['Mobil80', 'uMobi', 'Worktop']"
              />
            </v-col>
            <v-col class="mt-2" cols="12">
              <v-select
                outlined
                dense
                label="Select User"
                :items="['Anusha', 'Chandana', 'Jisha']"
              />
            </v-col>

            <!-- <v-col cols="12">
              <div>Map Role</div>
              <v-radio-group v-model="mapping" row>
                <v-radio label="Organization Level" value="orgLevel"></v-radio>
                <v-radio label="Group Level" value="groupLevel"></v-radio>
                <v-radio label="Location Level" value="groupLevel"></v-radio>
              </v-radio-group>
            </v-col> -->
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
export default {
  props: {
    mappingRolesDialog: Boolean,
  },
  data() {
    return {
      rolesList: "",
    };
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
  },
};
</script>