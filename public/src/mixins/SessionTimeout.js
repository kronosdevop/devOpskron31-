// sessionTimeoutMixin.js
export default {
    data() {
        return {
            timeout: null,
            timeoutDuration: 7200000, // 2 hours in milliseconds
        };
    },
    created() {
        this.startTimer();
        this.addEventListeners();
    },
    beforeDestroy() {
        this.clearTimer();
        this.removeEventListeners();
    },
    methods: {
        startTimer() {
            this.clearTimer();
            this.timeout = setTimeout(this.handleSessionTimeout, this.timeoutDuration);
        },
        resetTimer() {
            this.startTimer();
        },
        clearTimer() {
            clearTimeout(this.timeout);
        },
        handleSessionTimeout() {
            // Logic to log out the user
            // alert("You have been logged out due to inactivity.");
            localStorage.removeItem('userToken'); // Clear session storage or token
            this.$router.push('/'); // Redirect to login page
        },
        addEventListeners() {
            window.addEventListener('mousemove', this.resetTimer);
            window.addEventListener('keypress', this.resetTimer);
            window.addEventListener('click', this.resetTimer);
            window.addEventListener('scroll', this.resetTimer);
            // You can add more event listeners as needed
        },
        removeEventListeners() {
            window.removeEventListener('mousemove', this.resetTimer);
            window.removeEventListener('keypress', this.resetTimer);
            window.removeEventListener('click', this.resetTimer);
            window.removeEventListener('scroll', this.resetTimer);
        },
    },
};
