<template name="signup">
  <div id="signup" class="pt-3">
    <h1> Sign Up </h1>
    <!-- Modal Component -->

    <div id="signupForm" class="container fluid">
      <b-form @submit="onSubmit" validated>
        <b-alert :show="errors.show" variant="danger">{{errors.message}}</b-alert>

        <b-form-group id="emailAddressInputGroup"
                      label="Email address:"
                      label-for="emailAddress"
                      description="We'll never share your email with anyone else.">
          <b-form-input id="emailAddress"
                        type="email"
                        v-model="form.email"
                        required
                        placeholder="Enter email">
          </b-form-input>
        </b-form-group>
        <b-form-group id="usernameInputGroup"
                      label="Username:"
                      label-for="usernameInput"
                      description="This will be displayed on the leaderboard">
          <b-form-input id="usernameInput"
                        type="text"
                        v-model="form.username"
                        required
                        placeholder="Choose a username">
          </b-form-input>
        </b-form-group>

        <b-form-group id="passwordInputGroup"
                      label="Password:"
                      label-for="passwordInput">
          <b-form-input id="passwordInput"
                        type="password"
                        v-model="form.password"
                        required
                        placeholder="Password">
          </b-form-input>
        </b-form-group>

        <b-form-group id="password2InputGroup"
                      label="Password Again:"
                      label-for="password2Input">
          <b-alert :show="!validated" variant="danger">
            Make sure your passwords match!
          </b-alert>
          <b-form-input id="password2Input"
                        type="password"
                        v-model="form.password2"
                        required
                        placeholder="Confirm password">
          </b-form-input>
        </b-form-group>



        <b-button type="submit" variant="primary" :disabled="!validated">Submit</b-button>

        <p class="mt-3">
          Already have an account? <router-link to="/login">Log In</router-link>
        </p>

      </b-form>
    </div>
  </div>
</template>
<style>
#signup {
  min-height: 100vh;
}
</style>
<script>

  import firebase from 'firebase';
  import Terms from '@/components/Terms';
  import config from '../config';

  export default {
    name: 'signup',
    data() {
      return {
        form: {
          email: '',
          password: '',
          password2: '',
          username: '',
          consented: false,
        },
        show: true,
        errors: {
          show: false,
          message: null,
        },
      };
    },
    components: { terms: Terms },
    computed: {
      validated() {
        return this.form.password === this.form.password2;
      },
      consentFormLabel() {
        return this.form.consented ? 'You have consented!' : 'Click to read and sign the consent form';
      },
    },
    methods: {
      onSubmit(e) {
        e.preventDefault();
        // check for a unique username
        console.log('submitted form');
        firebase.database().ref('users').child(this.form.username).once('value')
        .then((snapshot) => {
          const val = snapshot.val();
          console.log('existing username val is', val);
          if (!val) {
            this.createAccount();
          } else {
            this.errors.show = true;
            this.errors.message = 'Username already exists! Please choose a unique username';
          }
        });
      },

      saveConsent(e) {
        e.preventDefault();
        this.form.consented = true;
        this.$refs.consentform.hide();
      },

      openConsentModal() {
        this.$refs.consentform.show();
      },

      createAccount() {
        firebase.auth().createUserWithEmailAndPassword(this.form.email, this.form.password).then(
          (user) => {
            console.log('user created', user);
            this.updateProfile(user);
          }, (err) => {
          console.log('error', err);
          this.errors.show = true;
          this.errors.message = err.message;
        });
      },

      insertUser(user) {
        console.log('inserting user', user.displayName);
        firebase.database().ref('users').child(user.displayName).set({
          score: 0,
          level: 0,
          admin: false,
          taken_tutorial: false,
          consent: this.form.consented,
          consentedOn: new Date(),
        }).then(() => {
            console.log('user inserted, now go home');
            //this.$router.push('/');
            this.$emit('login', user);
        });
      },
      updateProfile(user) {
        console.log('updating user profile', user);
        user.updateProfile({
          displayName: this.form.username,
        }).then(() => {
            // Profile updated successfully!
          this.insertUser(user);
          if (config.needsTutorial) {
            this.$router.replace('tutorial');
          } else {
            this.$router.replace('');
          }
        }, (err) => {
            // An error happened.
          this.errors.show = true;
          this.errors.message = err.message;
        });
      },
    },
  };
</script>
