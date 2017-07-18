const checkAuth = require('../shared/jwtMiddleware')

checkAuth(process.env.token)
  .then(function(info) {
    process.stdout.write(
      ' <a href="mailto:orion@orionfree.com"> <i class="zmdi zmdi-email"></i> &nbsp; orion@orionfree.com </a> <br /> <a href="tel:3013791929"> <i class="zmdi zmdi-local-phone"></i> &nbsp; 301-379-1929 </a> '
    )
  })
  .catch(function(e) {
    process.stdout.write('Missing Token. Try requesttoken')
  })
