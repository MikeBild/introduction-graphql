import Notie from 'notie';
import 'notie/dist/notie.css';

const Notification = {
  error: message => Notie.alert({ type: 3, text: message, time: 5 }),
  success: message => Notie.alert({ type: 1, text: message, time: 5 }),
  input: (submitCallback, cancelCallback) =>
    Notie.input({
      text: 'Please enter your name:',
      submitText: 'Submit',
      cancelText: 'Cancel',
      cancelCallback: cancelCallback || (() => {}),
      submitCallback: submitCallback || (() => {}),
      value: '',
      type: 'text',
      placeholder: 'name lastname',
    }),
};

export default Notification;
