Form Saver
=================================

FS (Form Saver) is make to save your users time while filling short or long forms. It uses localStorage (by default) to register locally datas given by the user while completing your page forms.
In case of browser crash, the script re-fill forms (automatically or by asking to user depending on you settings, again) to avoid user frustration.

## How to use it

### To start

First of all, you need to get the `src` folder content. Choose your own way to do so (clone this repository, download it manually, choose a dependencies manager, etc.)

Then link the script to your document, the one with a form to save, putting those lines of code before the `</body>` tag.

```HTML
<script src="/assets/src/form-saver.min.js"></script>
<script>
	var fs = new FormSaver( 'myform' );
	fs.init();
</script>
```

Replace `/assets/src/` by the right folder, and remove `.min` from the file name if you need to test things in development. Keep `.min` to get the minified version which is better for performance.

`myform` is the `id` or `name` attribute value of the form you need to declare before initiating the script.

### Optional arguments

```JavaScript
var fs = new FormSaver( 'myform', {
	storageType     : 'local',
	storageID       : 'ID123',
	storageDuration : 30, // not supported yet.
} );
```

### Multiple forms to save

In case you need to save multiple form, or have a generic way to declare FormSaver on complexe forms (yeah remember not to use FormSaver on small forms, it's really not necessary), this is an example of code.

```HTML
<script src="/assets/src/form-saver.min.js"></script>
<script>
	const fs = new FormSaver( 'myform' );
	fs.init();
</script>
```

### API / Methods

* `init`<br>The only way to make Form Saver work.
```JavaScript
var fs = new FormSaver( 'form-name' );
fs.init();
```
 
* `stop`/`pause`<br>Stop Form Saver saving the value of your form fields.
```JavaScript
if ( somethingHappens() ) {
	fs.pause();
}
```
If you need to save things again, just use `init()` method.
```JavaScript
if ( IneedToSaveAgain() ) {
	fs.init();
}
```

* `destroy`<br>Destroy all datas stored.
```JavaScript
if ( somethingHappens() ) {
	fs.destroy();
}
```
Use it when you don't need datas anymore. *e.i after form validation.*

* `getDatas`<br>Get all the datas stored.
```JavaScript
if ( somethingHappens() ) {
	const datas = fs.getDatas();
	console.log( datas );
	// return an object with stored values.

	console.log( datas['my-form-name'] );
	// return the value of `#name` field from `#my-form` form.
}
```

## Forms Good Practices

### Security concern

Some fields/datas should never be saved to avoid security issues. I have in mind:

* Credit Card information (save the big number, but not the security code)
* Password field (in "show my password" mode)
* Sensitive datas (security number, unique tokens, etc.)

To prevent those fields from being automatically saved, you can use different tricks:

* `type="password"` won't be saved,
* fields with `data-fs-save="false"` attribute won't be saved,
* fields with those `autocomplete` attribute values won't be saved
	* [`cc-csc`](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#attr-fe-autocomplete-cc-csc): Security code for the payment instrument (also known as the card security code (CSC), card validation code (CVC), card verification value (CVV), signature panel code (SPC), credit card ID (CCID), etc)
	* [`new-password`](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#attr-fe-autocomplete-current-password): a new password (e.g. when creating an account or changing a password) 
	* [`current-password`](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#attr-fe-autocomplete-new-password): The current password for the account identified by the username field (e.g. when logging in) 

In case you have a doubt about the sensitivity of a data, just use `data-fs-save="false"` on that `input`.

### Form name/ID

A form should always be distinguishable thanks to a uniq identifier: `id` attribute or `name` attribute are the keys to make FS work. You need to fill one of them.

### Keep the user in mind

Filling forms fields with user datas is kind of creepy when you think of that. Of course you can't access those datas, but the user is not supposed to know that. That's why FS propose by default a little message informing user when the page with the form is opening again with datas stored. The user have the possibility to use saved datas, or to use a new blank form.

From the outside, as developer, you have access to methods to make the User Experience even better.
For example, you could suggest to the users to choose if they want their datas being saved or not at the beginning. `stop`, `pause` and `destroy` method will help you.


## Specific behaviours

This script has some basic "automatic" behaviours you should know.

### `name` and `id` attributes

As you should know, `name` and `id` attributes should always be provided for each input, select, textarea or whatever-form element you use.

* to compose the **field key** of the value saved, the script uses by default the `id` attribute in its methods for not grouped inputs, and `name` as fallback is `id` is not provided.
* to do the same with grouped inputs (checkboxes, radios), the script uses only the `name` attribute as **field key**.
* the global key of an item (localStorage or sessionStorage item) is composed with the **form unique ID** and the **field key**

Example if you want to get the value of a field in that form (that would be already saved):

```HTML
<form id="my-form">
	<p>
		<label for="name">Name</label>
		<input type="text" id="name" name="the-name" value="">
	</p>
	<p>
		<span class="label-like" id="color-label">Colors:</span>

		<input type="checkbox" value="Red" name="colors" id="color-red" aria-labelledby="color-label">
		<label for="color-red">Red</label>

		<input type="checkbox" value="Green" name="colors" id="color-green" aria-labelledby="color-label">
		<label for="color-green">Green</label>

		<input type="checkbox" value="Blue" name="colors" id="color-blue" aria-labelledby="color-label">
		<label for="color-blue">Blue</label>
	</p>
</form>
```

You'll need to do that in JS for the name:

```JavaScript
var name_value = window.localStorage.getItem( 'my-form-name' );
console.log( name_value ); // (string) the value of the field.
```

For the same input, if you don't provide `id`, just replace `name` by `the-name`.

To get the checkboxes value(s), use:

```JavaScript
var checks = window.localStorage.getItem( 'my-form-colors' );
console.log( checks ); (array) the list of id(s) of checked checkbox(es).
```


## Limitations

Don't forget this script is an helper to save user time. If saving datas is a big challenge for you business, you should save them on your server and not locally on the user computer.

### iOS

On iOS since 5.1, Safari Mobile store localStorage datas in the cache directory which can be cleaned by the OS when memory space in full.

## Work In Progress

Next versions will be release with those future support.

### Select multiple

Select with attribute `multiple` is not tested and a priori not supported yet.

### `storageDuration` parameter

It's in the source code, but this parameter has no effect yet.

### Information messages

A bunch of messages to:

* warn users their browser just crashed
* activate/deactivate save-mode directly by the user himself

## Browser Support

This is an estimated table of browser support:

| Chrome  | Firefox | Edge | Opera | Safari | IE |
| ------- | ------- | ---- | ----- | ------ | -- |
|    41   |   44    |  12  |  17   |   10   | 11 |

Mobile:

| Android Webview  | Chrome Android | Edge | Firefox Android | Opera Android | iOS Safari |
| ---------------- | -------------- | ---- | --------------- | ------------- | ---------- |
|        41        |       41       |  12  |        44       |       17      |     10     |

## Humans behind the code

* **Geoffrey Crofte**<br>First idea and first release. Lead Dev.
* **Stéphanie Walter**<br>First beta tester. UX Ideas.
