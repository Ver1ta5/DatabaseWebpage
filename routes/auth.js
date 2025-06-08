module.exports={
    ifAuthenticated:function (req,res,next){
      if(req.isAuthenticated()){
        req.userId = req.session.passport.user; 
        return next()
       }
       res.redirect('/')
    }
  }