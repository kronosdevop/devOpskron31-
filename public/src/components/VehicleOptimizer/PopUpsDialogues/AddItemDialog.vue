<template>
    <div>
        <!-- eslint-disable -->
        <v-dialog :model-value="addlistItem" @update:model-value="$emit('update:addlistItem', $event)" persistent max-width="450" transition="dialog-top-transition">
            <v-card>
                <v-toolbar elevation="0" dark dense class="navBar">
                    <v-toolbar-title class="text--black ml-2">
                        <div class="custom-title">Create Item</div>
                    </v-toolbar-title>
                    <v-spacer />
                    <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
                </v-toolbar>
                <v-card-text class="mt-4">
                    <v-form ref="form">
                        <v-row>
                            <v-col cols="12">
                                <v-text-field
                                    outlined
                                    dense
                                    label="Item Name"
                                    :rules="[(v) => !!v || 'Required']"
                                    v-model="item_name"
                                ></v-text-field>
                                <v-text-field
                                    outlined
                                    dense
                                    :rules="[(v) => !!v || 'Required']"
                                    label="Inner Length(mts)"
                                    v-model="item_length"
                                ></v-text-field>
                                <v-text-field
                                    outlined
                                    dense
                                    :rules="[(v) => !!v || 'Required']"
                                    label="Inner Width(mts)"
                                    v-model="item_width"
                                ></v-text-field>
                                <v-text-field
                                    outlined
                                    dense
                                    :rules="[(v) => !!v || 'Required']"
                                    label="Inner Height(mts)"
                                    v-model="item_height"
                                ></v-text-field>
                                <v-text-field
                                    outlined
                                    dense
                                    :rules="[(v) => !!v || 'Required']"
                                    label="Load(lb)"
                                    v-model="max_load"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                        <v-row class="mt-n12">
                            <v-col cols="6">
                                    <v-checkbox
                                        v-model="fragile"
                                        label="Is Fragile"
                                        :true-value="true"
                                        :false-value="false"
                                    ></v-checkbox>
                                </v-col>   
                                <v-col cols="6">
                                    <v-checkbox
                                        v-model="rotate_allowed"
                                        :label="rotate_allowed ? 'Enable Rotation' : 'Disable Rotation'"
                                        :true-value="false"
                                        :false-value="true"
                                    ></v-checkbox>
                                </v-col>
                                <v-col cols="6" class="mt-n12">
                                <v-checkbox
                                    v-model="stack_allowed"
                                    :label="stack_allowed ? 'Enable Stack' : 'Disable Stack'"
                                    :true-value="false"
                                    :false-value="true"
                                ></v-checkbox>
                                </v-col>
                                <v-col cols="6" class="mt-n12">
                                <v-checkbox
                                    v-model="tilt_allowed"
                                    :label="tilt_allowed ? 'Enabled Tilt' : 'Disable Tilt'"
                                    :true-value="false"
                                    :false-value="true"
                                ></v-checkbox>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>
                <v-card-actions class="justify-end">
                    <v-btn
                        depressed
                        :loading="loading"
                        @click="create_item()"
                        dark
                        class="cardCss mt-n4 button-corner text-capitalize"
                    >
                        Create
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
/* eslint-disable */
import { API, graphqlOperation } from "aws-amplify";
import { create_edit_delete_cargo_items } from "@/graphql/mutations.js";
export default {
    props: {
        addlistItem: Boolean,
    },

    data() {
        return {
            item_name: "",
            item_height: "",
            item_width: "",
            item_length: "",
            max_load: "",
            loading: false,
            fragile: false,
            rotate_allowed: false,
            stack_allowed: false,
            tilt_allowed: false,
        };
    },

    methods: {
        close_dialog() {
            this.$emit("clicked", 0);
            this.fragile = false;
            this.rotate_allowed = false;
            this.stack_allowed = false;
            this.tilt_allowed = false;
        },

        create_item() {
    if (this.$refs.form.validate()) {
        this.create_cargo_item();
    } else {
        this.fragile = false;
        this.rotate_allowed = false;
        this.stack_allowed = false;
        this.tilt_allowed = false;
    }
},

        async create_cargo_item() {
            this.loading = true;
            try {
                let result = await API.graphql(
                    graphqlOperation(create_edit_delete_cargo_items, {
                        input: {
                            action_type: "CREATE_CARGO_ITEM",
                            cargo_item_name: this.item_name,
                            height_in_mts: this.item_height,
                            length_in_mts: this.item_length,
                            width_in_mts: this.item_width,
                            max_load_in_lb: this.max_load,
                            is_fragile: this.fragile,
                            is_rotate_allowed: this.rotate_allowed,
                            is_stack_allowed : this.stack_allowed,
                            is_tilt_allowed: this.tilt_allowed,
                        }
                    })
                );
                var response = JSON.parse(result.data.create_edit_delete_cargo_items);
                this.loading = false;
                if (response.Status == "SUCCESS") {
                    this.$emit("successMsg", response.Message);
                    this.$refs.form.reset();
                } else {
                    this.$emit("errorMsg", response.Message);
                }
            } catch (error) {
                this.$emit("errorMsg", error.errors[0].message);
                this.loading = false;
            }
        },
    }
}
</script>
