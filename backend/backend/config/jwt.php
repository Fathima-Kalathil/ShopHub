<?php

return [
    'secret' => env('JWT_SECRET', 'dev-secret-change-me-use-a-long-random-string'),
    'ttl' => 60 * 60 * 24 * 7, // 7 days
];
