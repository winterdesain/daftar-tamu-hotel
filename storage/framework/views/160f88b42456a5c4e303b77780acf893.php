<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>CRM - Laravel</title>
    <link rel="stylesheet" href="<?php echo e(asset('css/style.css')); ?>">
</head>
<body>
    <!-- <nav>
        <a href="<?php echo e(url('/')); ?>">Home</a> |
        <a href="<?php echo e(route('customers.index')); ?>">Customers</a> |
        <?php if(session('user')): ?>
            <span>Hai, <?php echo e(session('user.name')); ?></span>
            <a href="<?php echo e(route('auth.logout')); ?>">Logout</a>
        <?php else: ?>
            <a href="<?php echo e(route('auth.login')); ?>">Login</a>
        <?php endif; ?>
    </nav> -->
    <main>
        <?php echo $__env->yieldContent('content'); ?>
    </main>
    <script src="<?php echo e(asset('js/app.js')); ?>"></script>
</body>
</html>
<?php /**PATH C:\Users\Winter\OneDrive\Pictures\crm_laravel_project\resources\views/layouts/app.blade.php ENDPATH**/ ?>