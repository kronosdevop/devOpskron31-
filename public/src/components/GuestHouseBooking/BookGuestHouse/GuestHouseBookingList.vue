<template>
    <div>
        <v-card class="mt-2"  flat>
            <OverlayComp :overlay="overlay" />
            <v-card-text>
                <v-row>
                    <v-col
                        v-for="(item, index) in activeItems"
                        :key="index"
                        cols="12"
                        sm="4"
                    >
                        <v-card :height="cardhegitht" class="cursor-pointer mx-auto">
                            <v-carousel
                                v-if="item.image && item.image.length > 0"
                                hide-delimiter-background
                                delimiter-icon="mdi-minus"
                                height="250"
                                :continuous="false"
                                :cycle="cycle"
                                :show-arrows="false"
                            >
                                <v-carousel-item
                                    v-for="(img, imgIndex) in item.image"
                                    :key="imgIndex"
                                    @click="View_GuestHouse(item)"
                                    :src="img"
                                />
                            </v-carousel>  
                            <v-card-title class="ml-n3 d-flex justify-space-between align-center" style="font-size: medium;">
                                {{ item.name }}
                                <v-tooltip bottom>
                                    <template #activator="{ on, attrs }">
                                        <v-icon 
                                            class="d-flex align-center" 
                                            @click="View_GuestHouse(item)" 
                                            color="primaryColor"
                                            v-bind="attrs"
                                            v-on="on"
                                        >
                                            mdi-button-pointer
                                        </v-icon>
                                    </template>
                                    <span>Guest House Booking</span>
                                </v-tooltip>
                            </v-card-title>
                            <v-card-subtitle class="ml-n3">
                                {{ item.location_address ? item.location_address.slice(0, 40) + (item.location_address.length > 40 ? '...' : '') : '' }}
                            </v-card-subtitle>
                            <v-card-title class="ml-n3 mt-n8" style="font-size: medium;">
                                {{ item.is_price_visible ? `₹${item.cost}/night` : '' }}
                            </v-card-title>
                        </v-card>
                    </v-col>
                </v-row>
                <div class="center-container" v-if="activeItems == ''">
                    <span v-if="activeItems == ''">No Guest House Found!</span>
                </div>
            </v-card-text>
        </v-card>
        <div v-if="componentCheck == 1">
            <ViewGuestHouse
                :GuesthouseDetail = "GuesthouseDetail"
                :ViewInfo = "ViewInfo"
                @clicked="GuesthouseDetail = false"
                v-on:errorMsg="error_info"
                v-on:successMsg="success_info"
            />
        </div>
        <SnackBar :SnackBarComponent="SnackBarComponent" />
    </div>
</template>

<script>
import OverlayComp from "@/components/OverlayComp.vue";
import { lit_org_guest_houses } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import ViewGuestHouse from "@/components/GuestHouseBooking/BookGuestHouse/ViewGuestHouse.vue";
import SnackBar from "@/components/SnackBar.vue";

export default {
    components: {
        OverlayComp,
        ViewGuestHouse,
        SnackBar,
    },

    data() {
        return {
            overlay: false,
            items: [],
            cardhegitht: 360,
            ViewInfo: {},
            GuesthouseDetail: false,
            componentCheck: 0,
            SnackBarComponent: {},
            cycle: false,
        };
    },

    computed: {
        activeItems() {
            return this.items.filter(item => item.guest_house_status === "ACTIVE");
        }
    },

    mounted() {
        this.fetch_guest_list();
    },

    methods: {
        async fetch_guest_list() {
            this.overlay = true;
            try {
                let result = await API.graphql(
                    graphqlOperation(lit_org_guest_houses, {
                        input: {
                            limit: 100,
                            nextToken: this.nextToken,
                        },
                    })
                );
                this.overlay = false;
                let response = JSON.parse(result.data.lit_org_guest_houses);

                if (response.Status === "SUCCESS") {
                    this.items = response.data.map((item) => ({
                        name: item.guest_house_name,
                        image: item.guest_houser_images,
                        cost: item.week_day_price,
                        guest_house_description: item.guest_house_description,
                        allowed_guests: item.allowed_guests,
                        location_long: item.location_long,
                        organization_id: item.organization_id,
                        weekend_price: item.weekend_price,
                        is_price_visible: item.is_price_visible,
                        guest_house_status: item.guest_house_status,
                        guest_house_id: item.guest_house_id,
                        location_lat: item.location_lat,
                        location_pincode: item.location_pincode,
                        discounts: item.discounts,
                        location_address: item.location_address,
                        entry_logs: item.entry_logs,
                        guest_house_type: item.guest_house_type,
                        payment_upi_id: item.payment_upi_id,
                        guest_house_no: item.guest_house_no,
                        organization_display_id: item.organization_display_id,
                    }));
                }
            } catch (error) {
                this.overlay = false;
                console.error("Error fetching guest houses:", error);
            }
        },

        View_GuestHouse(item) {
            // console.log("item", item )
            this.componentCheck = 1;
            this.ViewInfo = item;
            this.GuesthouseDetail = true;
        },

        async success_info(val) {
            this.SnackBarComponent = {
                SnackbarVmodel: true,
                SnackbarColor: "green",
                SnackbarText: val,
                timeout: 5000,
                Top: true,
            };
            this.GuesthouseDetail = false;
            this.fetch_guest_list();
        },

        error_info(val) {
            this.SnackBarComponent = {
                SnackbarVmodel: true,
                SnackbarColor: "red",
                SnackbarText: val,
                timeout: 5000,
                Top: true,
            };
        },
    }
};
</script>

<style scoped>
.center-container {
    display: flex;
    justify-content: center;
    align-items: center; 
    height: 70vh;
    width: 100%; 
    text-align: center; 
    font-size: 20px;
}
</style>