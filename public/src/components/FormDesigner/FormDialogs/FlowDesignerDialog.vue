<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="flowDialog" @update:model-value="$emit('update:flowDialog', $event)" persistent max-width="600" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2"
            >  <div class="custom-title">
            Create Flow
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-4">
          <v-list>
            <v-list-item>
              <v-list-item-avatar>
                <v-icon color="green" dark> mdi-cog </v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="green-text">Start </v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-row no-gutters>
                  <v-col cols="6">
                    <v-btn
                      small
                      class="white--text"
                      @click="add_dialog()"
                      color="green"
                    >
                      <v-icon small color="white"> mdi-plus </v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-list-item-action>
            </v-list-item>
            <v-list-item>
              <v-list-item-avatar>
                <v-icon color="red" dark> mdi-cog </v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="red-text">Stop </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="save_data()"
            dark
            class="cardCss button-corner text-capitalize"
          >
            Publish
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog :model-value="addData" @update:model-value="$emit('update:addData', $event)" persistent max-width="500" transition="dialog-top-transition">
      <v-card flat>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
              <div class="custom-title">
            Configure Steps
          </div></v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-list>
            <v-list-item-group v-model="stepsSelected">
              <v-list-item @input="get_input(stepsSelected)">
                <template>
                  <v-list-item-action>
                    <v-radio-group v-model="initiaorCheck">
                      <v-radio value="initiator" color="primary"></v-radio>
                    </v-radio-group>
                  </v-list-item-action>

                  <v-list-item-content>
                    <v-list-item-title>Initiator</v-list-item-title>
                  </v-list-item-content>
                </template>
              </v-list-item>
              <v-list-item @input="get_input(stepsSelected)">
                <template>
                  <v-list-item-action>
                    <v-radio-group v-model="initiaorRM">
                      <v-radio
                        value="repotingManager"
                        color="primary"
                      ></v-radio>
                    </v-radio-group>
                  </v-list-item-action>

                  <v-list-item-content>
                    <v-list-item-title
                      >Initiator's - Reporting Manager</v-list-item-title
                    >
                  </v-list-item-content>
                </template>
              </v-list-item>

              <v-list-item @input="get_input(stepsSelected)">
                <template>
                  <v-list-item-action>
                    <v-radio-group v-model="teamMember">
                      <v-radio value="member_team" color="primary"></v-radio>
                    </v-radio-group>
                  </v-list-item-action>
                  <v-list-item-content v-if="teamMember != 'member_team'">
                    <v-list-item-title>Team Member</v-list-item-title>
                  </v-list-item-content>
                  <!--  <v-list-item-content v-if="teamMember == true"> -->
                  <v-row dense no-gutters v-if="teamMember == 'member_team'">
                    <v-col class="mt-6" cols="4">
                      <v-list-item-title>Team Member</v-list-item-title>
                    </v-col>
                    <v-col cols="8">
                      <v-select
                        dense
                        outlined
                        class="mt-3"
                        @change="get_input(2)"
                        v-model="teamMemberSelected"
                        :items="userList"
                        item-text="full_user_name"
                        item-value="user_id"
                        return-object
                        label="Select"
                      />
                    </v-col>
                  </v-row>
                  <!-- </v-list-item-content> -->
                </template>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn small @click="add_items()" class="white--text cardCss"
            >Add</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
export default {
  props: {
    flowDialog: Boolean,
    formDetails: Object,
  },
  data() {
    return {
      loading: false,
      inputRecords: [],
      teamMember: null,
      initiaorCheck: null,
      initiaorRM: null,
      addData: false,
    };
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    add_dialog() {
      this.inputRecords = [];
      this.teamMember = null;
      this.initiaorCheck = null;
      this.initiaorRM = null;
      this.addData = true;
    },
    save_data() {},
  },
};
</script>