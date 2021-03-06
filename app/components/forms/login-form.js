import Ember from 'ember';
import FormMixin from 'open-event-frontend/mixins/form';

const { Component } = Ember;

export default Component.extend(FormMixin, {

  identification : '',
  password       : '',
  isLoading      : false,

  getValidationRules() {
    return {
      inline : true,
      delay  : false,
      on     : 'blur',
      fields : {
        identification: {
          identifier : 'email',
          rules      : [
            {
              type   : 'empty',
              prompt : this.i18n.t('Please enter your email ID')
            },
            {
              type   : 'email',
              prompt : this.i18n.t('Please enter a valid email ID')
            }
          ]
        },
        password: {
          identifier : 'password',
          rules      : [
            {
              type   : 'empty',
              prompt : this.i18n.t('Please enter your password')
            }
          ]
        }
      }
    };
  },

  actions: {
    submit() {
      this.onValid(() => {
        let credentials = this.getProperties('identification', 'password'),
            authenticator = 'authenticator:jwt';

        this.set('errorMessage', null);
        this.set('isLoading', true);

        this.get('session')
          .authenticate(authenticator, credentials)
          .then(() => {
            this.get('loader').get('/users/me').then(data => {
              this.get('session').set('data.currentUser', data);
            });
          })
          .catch(reason => {
            if (reason.hasOwnProperty('code') && reason.code === 401) {
              this.set('errorMessage', this.i18n.t('Your credentials were incorrect.'));
            } else {
              this.set('errorMessage', this.i18n.t('An unexpected error occurred.'));
            }
            this.set('isLoading', false);
          })
          .finally(() => {
            this.set('password', '');
          });
      });
    }
  },

  didInsertElement() {
    if (this.get('session.newUser')) {
      this.set('newUser', this.get('session.newUser'));
      this.set('identification', this.get('session.newUser'));
      this.set('session.newUser', null);
    }
  }
});
