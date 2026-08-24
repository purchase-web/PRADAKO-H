<?php

/*
|--------------------------------------------------------------------------
| PRADAKO PORTAL SMTP CONFIGURATION
|--------------------------------------------------------------------------
|
| Keep this file private.
| Do not share the password or place it inside HTML or JavaScript.
|
| Ask your hosting provider for:
| - SMTP host
| - SMTP port
| - Encryption type
| - SMTP username
| - SMTP password
|
*/

return [

    /*
     * Common cPanel mail hostname:
     * mail.pradakomechanicals.com
     *
     * Replace it if your hosting provider gives you
     * a different outgoing mail server.
     */

    'host' => 'mail.pradakomechanicals.com',

    /*
     * Use:
     * 465 with encryption "ssl"
     * or
     * 587 with encryption "tls"
     */

    'port' => 465,

    'encryption' => 'ssl',

    'username' => 'info@pradakomechanicals.com',

    /*
     * Enter the real mailbox or SMTP password.
     */

    'password' => 'YOUR_EMAIL_PASSWORD_HERE',

    'from_email' => 'info@pradakomechanicals.com',

    'from_name' => 'Pradako Portal Team',

    /*
     * All access requests are delivered here.
     */

    'admin_email' => 'info@pradakomechanicals.com',

    'admin_name' => 'Pradako Portal Administrator'
];