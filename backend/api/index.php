<?php

// Entry point for Vercel's PHP runtime. Everything is handled by Laravel.
//
// The script lives in the "api/" folder, which makes PHP treat "/api" as the base
// URL and strip it from the path (so /api/products reaches Laravel as /products).
// Point the script variables at public/index.php so Laravel sees the real URL.
$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['PHP_SELF'] = '/index.php';
$_SERVER['SCRIPT_FILENAME'] = __DIR__.'/../public/index.php';

require __DIR__.'/../public/index.php';
