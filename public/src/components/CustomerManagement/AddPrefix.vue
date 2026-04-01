<template>
    <div>
        <!-- eslint-disable -->
        <v-dialog :model-value="addPrefixDialog" persistent max-width="450" transition="dialog-top-transition"> 
            <v-card>
                <v-toolbar elevation="0" dark density="compact" class="navBar">
                    <v-toolbar-title class="text--black ml-2">
                        <div class="custom-title">
                            {{ prefix === '' ? 'Add Prefix' : 'Edit Prefix' }}
                        </div>
                    </v-toolbar-title>
                    <v-spacer />
                    <v-icon class="icon-class mr-2" @click="close_dialog()">mdi-close</v-icon>
                </v-toolbar>
                <v-card-text class="mt-4">
                    <v-form ref="form">
                        <v-text-field
                            v-model="prefix"
                            label="Prefix*"
                            variant="outlined"
                            density="compact"
                        ></v-text-field>
                    </v-form>
                </v-card-text>
                <v-card-actions class="justify-end">
                    <v-btn
                        dark
                        size="small"
                        :loading="loading"
                        class="text-capitalize cardCss button-corner mt-n6"
                        @click="validateAndsave()"
                    >
                        Add
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
/* eslint-disable */
import { create_organization_prefixs } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
    props: {
        addPrefixDialog: Boolean,
        prefixData: String,
    },

    data() {
        return {
            prefix: "",
            rules: {
                required: (value) => !!value || "Prefix is required",
            },
            loading: false,
        }
    },

    watch: {
        addPrefixDialog: {
            immediate: true,
                async handler() {
                    const preData = this.prefixData;
                    this.prefix = preData || "";
                    // console.log("Prefix initialized as:", this.prefix);
            },
        },
    },


    methods: {
        close_dialog() {
            this.$emit("clicked", 0);
            // this.$refs.form.reset();
        },
        validateAndsave() {
            if(this.$refs.form.validate()) {
                this.Add_Prefix()
            }
        },

        async Add_Prefix() {
            this.loading = true;
            var data = this.$store.getters.GetUserObj;

            try {
                let result = await API.graphql(
                    graphqlOperation(create_organization_prefixs, {
                        input: {
                            organization_id: data.organization.organization_id,
                            prefix_name: this.prefix,
                            prefix_type: "CUSTOMER",
                        }
                    })
                );
                var response = JSON.parse(result.data.create_organization_prefixs);
                this.loading = false;
                if (response.Status == "SUCCESS") {
                    this.$emit("successMsg", response.Message);
                } else {
                    this.$emit("errorMsg", response.Message);
                }
            } catch (error) {
                this.$emit("errorMsg", error.errors[0].message);
                this.loading = false;
            }
        },
    },
}
</script>

<style>

</style>