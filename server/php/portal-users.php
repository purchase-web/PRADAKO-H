<?php

declare(strict_types=1);

/* =========================================================
   PRADAKO APPROVED PORTAL USERS

   Do not place plain passwords in this file.
   Store only password hashes.
========================================================= */

return [

    'PMEW-EMPLOYEE-01' => [
        'role' => 'employees',

        'password_hash' =>
            '$2y$12$1qHrLJTv0cX/QULkqvfZSerKXZbQ2HcZP8lj.TCwB1RBgrvxfcltm',

        'active' => true,
        'redirect' => '/index.html'
    ],

    'PMEW-CLIENT-01' => [
        'role' => 'client',

        'password_hash' =>
            '$2y$12$K4LrfM.0TPL73PxMh/n1q.qDk6KPwNhy77i9teXTf/KEo1PXkT5Me',

        'active' => true,
        'redirect' => '/index.html'
    ],

    'PMEW-SUPPLIER-01' => [
        'role' => 'supplier',

        'password_hash' =>
            '$2y$12$MzCiwp2e/0u6ZWr1C1LnQOK.1DjU3/76CgSSuB.OfAyFpKDimgNj2',

        'active' => true,
        'redirect' => '/index.html'
    ],

    'PMEW-AGENT-01' => [
        'role' => 'agent',

        'password_hash' =>
            '$2y$12$hJwKkzy4Z/bLjklq96Wpze4tCfhnHdau.iPoJkDfND3Mm0mq92RNu',

        'active' => true,
        'redirect' => '/index.html'
    ],

    'PMEW-DISTRIBUTOR-01' => [
        'role' => 'distributor',

        'password_hash' =>
            '$2y$12$GCl2JUFNmB3CWKcj/afCiufE13OFV7wz6vZRIlSOtoIjlUuZ8ciT.',

        'active' => true,
        'redirect' => '/index.html'
    ],

    'PMEW-DEALER-01' => [
        'role' => 'dealer',

        'password_hash' =>
            '$2y$12$fKlgILFIY681pSwLoav0Beyc4U0KSBiCAPNDH7sbjmLJQFvWABiEy',

        'active' => true,
        'redirect' => '/index.html'
    ]

];