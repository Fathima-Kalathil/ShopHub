<?php

$origins = env('FRONTEND_URL')
    ? array_map(fn ($o) => rtrim(trim($o), '/'), explode(',', env('FRONTEND_URL')))
    : ['*'];

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => $origins,
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
