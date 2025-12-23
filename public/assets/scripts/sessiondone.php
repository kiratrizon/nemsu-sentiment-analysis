<?php
if (isset($_SESSION['done'])) {
  $msg = $_SESSION['done'];
  echo "<script>
        Swal.fire({
          title: '$msg',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500
        });
      </script>";
  unset($_SESSION['done']);
}

if (isset($_SESSION['csvsuccess'])) {
  $msg = $_SESSION['csvsuccess'];
  echo "<script>$msg</script>";
  unset($_SESSION['csvsuccess']);
}
