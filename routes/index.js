var express = require('express');
var router = express.Router();
const path = require('path');
const jwt = require('jsonwebtoken');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { promisify } = require('util');
const nodemailer = require('nodemailer');
const sqlite3 = require("sqlite3").verbose();
require('dotenv').config();
/*Creacion de la Base de Datos*/
const dbRoot = path.join(__dirname, "/bd", "dbAdmin.db");
const dbAdmin = new sqlite3.Database(dbRoot, (err) => {
  let question = err ? err : 'database success';
  console.log(question);
});


/*=================================*/


pr = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const tokenAuthorized = await promisify(jwt.verify)(req.cookies.jwt, 'token');
      if (tokenAuthorized) {
        return next();
      }
      req.user = row.id;
    } catch (error) {
      console.log(error);
      return next();
    }
  } else {
    res.redirect("/cliente/login");
  }
};
/*Proteger el login*/
prl = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const tokenAuthorized = await promisify(jwt.verify)(req.cookies.jwt, 'token');
      if (tokenAuthorized) {
        res.redirect("/viewclient");
      }
    } catch (error) {
      console.log(error);
      res.redirect("/viewclient");
    }
  } else {
    return next();
  }
};

logout = async (req, res) => {
  res.clearCookie("jwt");
  return res.redirect("/cliente/login");
};












/*Vistas*/

router.get('/', function (req, res, next) {
  res.render('index');
});


router.get('/interfaz', (req, res) => {
  const sql = "SELECT * FROM categorias";
  dbAdmin.all(sql, [], (err, rows) => {
    console.log(rows)
    const sql_product = "SELECT * FROM productos"
    dbAdmin.all(sql_product, [], (err, rows_product) => {
      const sql_img = "SELECT * FROM imagenes";
      dbAdmin.all(sql_img, [], (err, rows_img) => {
        res.render("interfaz.ejs", {
          data: rows,
          data_product: rows_product,
          row_img: rows_img
        });
      })
    })
  })
});



router.get('/editcategory/', (req, res) => {
  /*
  const id = req.params.id;
  const sql = "SELECT * FROM categorias WHERE id = ?"
  dbAdmin.get(sql,id,(err,rows) => {
    res.render('editcategory',{data:rows})
  })*/
  const sql = "SELECT * FROM categorias";
  dbAdmin.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    } else {

      res.render("editcategory.ejs", { data: rows });
    }
  })
})

router.get('/addimg/:id', (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM productos WHERE id = ?"
  dbAdmin.all(sql, id, (err, row) => {
    if (err) {
      console.log(err)
    } else {
      res.render('addimg', { data: row })
    }
  })
})


router.post('/addimg/:id', (req, res) => {
  const destacado = 1
  const id = req.params.id;
  const producto_id = id;
  const img_url = req.body.url_img;
  const query = [producto_id, img_url, destacado, id]
  const sql = "UPDATE imagenes SET producto_id = ?, url = ?, destacado = ? WHERE ( id = ?)"
  dbAdmin.run(sql, query, (err) => {
    if (err) {
      console.log(err)
    }
    else {
      res.redirect('/interfaz')
    }
  })
})



router.post('/updatecategory/:id', (req, res) => {
  const id = req.params.id;
  const info = [req.body.updatecategory, id]
  const sql = "UPDATE categorias SET nombre = ? WHERE ( id = ?)";
  dbAdmin.run(sql, info, err => {
    if (err) {
      console.log(err)
    } else {
      res.redirect('/interfaz');
    }
  })
})


router.get('/editproduct/:id', (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM productos WHERE id = ?"
  const sql_category = "SELECT * FROM categorias"
  dbAdmin.get(sql, id, (err, row) => {
    dbAdmin.all(sql_category, (err, row_category) => {
      res.render('editproduct', {
        data: row,
        data_category: row_category
      })
    })

  })
})

router.get("/deleteproduct/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM productos WHERE id = ?";
  const sql_img = "DELETE FROM imagenes WHERE id = ?"
  dbAdmin.run(sql, id, err => {
    dbAdmin.run(sql_img, id, err => {
      if (err) {
        console.log(err);
      } else {
        res.redirect('/interfaz')
      }
    })
  });
})
/*
router.get("/deletecategory",(req, res)=>{

  const sql = "SELECT * FROM categorias"
  dbAdmin.all(sql,[],(err,row) => {
    res.render('deletecategory',{
      data:row
    })
  })
	
})

router.post("/deletecategory/:id",(req, res)=>{
  const id = req.params.id;
  const sql = "DELETE FROM categorias WHERE id = ?"
  dbAdmin.run(sql,id,err => {
    res.redirect('/interfaz')
  })
	
})

*/



router.post('/updateproduct/:id', (req, res) => {
  const id = req.params.id;
  const name = req.body.name;
  const code = req.body.code;
  const price = req.body.price;
  const description = req.body.description;
  const screen = req.body.screen;
  const cpu = req.body.cpu;
  const img_url = req.body.url;
  const id_category = req.body.category_id;
  const query = [name, code, price, description, screen, cpu, id_category, id]
  const sql = "UPDATE productos SET nombre = ?,codigo = ?,precio = ?, descripcion = ?,pantalla = ?,procesador = ?, categoria_id = ? WHERE (id = ?)"
  dbAdmin.run(sql, query, err => {
    if (err) {
      console.log(err)
    } else {
      res.redirect('/interfaz')
    }
  })
})




router.get('/addproduct', (req, res) => {
  const sql = "SELECT * FROM categorias";
  dbAdmin.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    } else {
      res.render("addproduct", {
        data: rows
      });
    }
  })
})

router.post('/category', (req, res) => {
  const category = req.body.category;
  dbAdmin.run(`INSERT INTO categorias (nombre) VALUES (?);`, [category], (err) => {
    if (err) {
      console.log(err)
    }
    else {
      res.redirect('/interfaz')
    }
  })
})

router.get('/addcategory', (req, res) => {
  res.render('addcategory')
})






router.post('/products', (req, res) => {
  const url_ghost = 'https://cdn2.iconfinder.com/data/icons/symbol-blue-set-3/100/Untitled-1-94-512.png';
  const id = '';
  const destacado = 1;
  const name = req.body.name;
  const code = req.body.code;
  const price = req.body.price;
  const description = req.body.description;
  const screen = req.body.screen;
  const cpu = req.body.cpu;
  const id_category = req.body.id_category;
  dbAdmin.run(`INSERT INTO productos (nombre, codigo, precio, descripcion, pantalla, procesador, categoria_id) VALUES (?,?,?,?,?,?,?);`,
    [name, code, price, description, screen, cpu, id_category], (err) => {
      dbAdmin.run(`INSERT INTO imagenes (producto_id,url,destacado) VALUES (?,?,?)`, [id, url_ghost, destacado], (err) => {
        if (err) {
          console.log(err)
        } else {
          res.redirect('/interfaz')
        }
      })
    });

})


router.post('/login', (req, res) => {
  const user = req.body.name;
  const password = req.body.password;
  if (user == process.env.ADMIN && password == process.env.ADMIN_PASSWORD) {
    res.redirect('/interfaz')
  }
  else {
    res.redirect('/')
  }
})



/*Client view*/

router.get('/viewclient', (req, res) => {
  const sql = "SELECT * FROM categorias";
  dbAdmin.all(sql, (err, rows) => {
    const sql_product = "SELECT productos.*, imagenes.url, AVG(puntos.puntos) as puntos FROM productos LEFT JOIN imagenes ON productos.id = imagenes.producto_id LEFT JOIN puntos ON productos.id = puntos.producto_id GROUP BY productos.id;"
    dbAdmin.all(sql_product, (err, rows_product) => {
      const a = []
      const b = []
      const c = []
      for (let i = 0; i < rows_product.length; i++) {
        a.push(rows_product[i].nombre);
        b.push(rows_product[i].pantalla);
        c.push(rows_product[i].procesador);
      }
      const unicos = new Set(a);
      const unicosP = new Set(b);
      const unicosPro = new Set(c);
        res.render("viewclient", {
          data: rows,
          data_product: rows_product,
          nameProduct: unicos,
          namePantalla: unicosP,
          nameProcesador: unicosPro
        });
      })
    })
  })






router.get('/viewclient/product/:id', (req, res) => {
  const { id } = req.params;
  const sql_img = "SELECT productos.*, imagenes.url, AVG(puntos.puntos) as puntos FROM productos LEFT JOIN imagenes ON productos.id = imagenes.producto_id LEFT JOIN puntos ON productos.id = puntos.producto_id WHERE productos.categoria_id = ?"
  const sql_cat = "SELECT * FROM categorias";
  dbAdmin.all(sql_img, id, (err, rowsProduct) => {
    const a = []
    const b = []
    const c = []
    for (let i = 0; i < rowsProduct.length; i++) {
      a.push(rowsProduct[i].nombre);
      b.push(rowsProduct[i].pantalla);
      c.push(rowsProduct[i].procesador);
    }
    const unicos = new Set(a);
    const unicosP = new Set(b);
    const unicosPro = new Set(c);
      dbAdmin.all(sql_cat, (err, rowsCategory) => {
        res.render("viewclient", {
          data: rowsCategory,
          data_product: rowsProduct,
          nameProduct: unicos,
          namePantalla: unicosP,
          nameProcesador: unicosPro
        });
      })
    })
  })


router.get('/viewproduct/product/:id', (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM productos WHERE id = ?";
  const sql_img = "SELECT * FROM imagenes WHERE producto_id = ?";
  const sqlCategory = "SELECT * FROM categorias"
  dbAdmin.get(sql, id, (err, rowsProduct) => {
    dbAdmin.get(sql_img, id, (err, rowsImg) => {
      dbAdmin.all(sqlCategory, (err, rowsCategory) => {
        res.render("viewproduct", {
          data: rowsCategory,
          data_product: rowsProduct,
          row_img: rowsImg
        });
      })
    })
  })
})

router.post('/viewproduct/product/:id', pr, (req, res) => {
  const { id } = req.params;
  const precio = req.body.precio;
  const cantidad = req.body.cantidad;
  const total = (cantidad * precio)
  const sql = "SELECT * FROM productos WHERE id = ?";
  const sql_img = "SELECT * FROM imagenes WHERE producto_id = ?";
  const sqlCategory = "SELECT * FROM categorias"
  dbAdmin.get(sql, id, (err, rowsProduct) => {
    dbAdmin.get(sql_img, id, (err, rowsImg) => {
      dbAdmin.all(sqlCategory, (err, rowsCategory) => {
        res.render("viewproductbuy", {
          data: rowsCategory,
          data_product: rowsProduct,
          row_img: rowsImg,
          preci: precio,
          cantida: cantidad,
          tota: total
        });
      })
    })
  })
})

router.post('/submit_payment/:id', async (req, res) => {
  const { id } = req.params;
  const numerotarjeta = req.body.numerotarjeta;
  const mes = req.body.mes;
  const ano = req.body.año;
  const cvv = req.body.cvv;
  const cantidad = req.body.cantidad;
  const total = req.body.total;
  const puntos = req.body.puntos;
  const fecha = new Date();
  const fechaHoy = fecha.toString();
  const ipcliente = (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection.remoteAddress;
  try {
    const response = await fetch('https://fakepayment.onrender.com/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ` + process.env.PAYMENT,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: total,
        "card-number": numerotarjeta,
        cvv: cvv,
        "expiration-month": mes,
        "expiration-year": ano,
        "full-name": "APPROVED",
        currency: "USD",
        description: "Transsaction Successfull",
        reference: "payment_id:10"
      }),
    });
    const result = await response.json();
    if (result.success) {
      const tokenauth = await promisify(jwt.verify)(req.cookies.jwt, 'token');
      const cliente_id = tokenauth.id;

      dbAdmin.run(`INSERT INTO ventas(cliente_id,producto_id,cantidad,total_pagado,fecha,ip_cliente) VALUES(?,?,?,?,?,?)`, [cliente_id, id, cantidad, total, fechaHoy, ipcliente], (err, row) => {
        if (err) {
          console.log(err)
        } else {
          dbAdmin.run(`INSERT INTO puntos(client_id,producto_id,puntos) VALUES (?,?,?)`,[cliente_id,id,puntos],(err,row)=> {
            const transporter = nodemailer.createTransport({
              service: 'outlook',
              port: 587,
              tls: {
                ciphers: "SSLv3",
                rejectUnauthorized: false,
              },
              auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PW,
              },
            });

            const mailOptions = {
              from: process.env.EMAIL,
              to: row.usuario,
              subject: '¡Su compra ah finalizado!',
              html: '<h1>¡Hola!</h1><p>Gracias por su compra!</p>' // html body
            };

            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });
          res.redirect("/viewclient");
          })
        }
      })
    }

  } catch (error) {
    console.log(error)
  }
})






router.get('/viewclient/:nombre', (req, res) => {
  const { nombre } = req.params;
  const sql_query = "SELECT * FROM productos";
  const sql_img = "SELECT productos.*, imagenes.url, AVG(puntos.puntos) as puntos FROM productos LEFT JOIN imagenes ON productos.id = imagenes.producto_id LEFT JOIN puntos ON productos.id = puntos.producto_id WHERE productos.nombre = ? OR productos.pantalla = ? OR productos.procesador = ? OR puntos.puntos = ? GROUP BY productos.id"
  const sql_cat = "SELECT * FROM categorias";
  const query = [nombre, nombre, nombre, nombre];
  dbAdmin.all(sql_query, (err, row) => {
    const a = []
    const b = []
    const c = []
    for (let i = 0; i < row.length; i++) {
      a.push(row[i].nombre);
      b.push(row[i].pantalla);
      c.push(row[i].procesador);
    }
    const unicos = new Set(a);
    const unicosP = new Set(b);
    const unicosPro = new Set(c);

      dbAdmin.all(sql_img, query, (err, rowsImg) => {
        dbAdmin.all(sql_cat, (err, rowsCategory) => {
          res.render("viewclient", {
            data: rowsCategory,
            data_product: rowsImg,
            nameProduct: unicos,
            namePantalla: unicosP,
            nameProcesador: unicosPro
          });
        })
      })
   
  })
});


router.post('/cliente/login', (req, res) => {
  const { corre, contrasena } = req.body;
  dbAdmin.get(`SELECT * FROM clientes WHERE email = ? AND contrasena = ?`, [corre, contrasena], (err, row) => {
    if (row) {
      const id = row.id;
      const token = jwt.sign({ id: id }, 'token');
      res.cookie("jwt", token);
      res.redirect('/viewclient')
    }
    else {
      console.log('Datos incorrectos');
      res.redirect('/cliente/login');
    }
  })
})
router.get('/cliente/login',prl, (req, res) => {
  res.render('login');
});

router.get('/cliente/registro', (req, res) => {
  res.render('register');
});

router.post('/cliente/registro', async (req, res) => {
  const { user, edad, dni, corre, contrasena } = req.body;
  const secretKey = "6LeDoU0pAAAAAIBcBUhaf8sIyoF2RJojZ-blAmTI"
  const gRecaptchaResponse = req.body['g-recaptcha-response'];
  const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${gRecaptchaResponse}`, {
    method: 'POST',
  });

  let verify = await response.json();

  if (verify.success == true) {
    dbAdmin.get(`SELECT * FROM clientes WHERE email = ?`, [corre], (err, row) => {
      if (row) {
        res.redirect('/cliente/registro')
      } else {
        dbAdmin.get(`INSERT INTO clientes(name,edad,dni,email,contrasena) VALUES(?,?,?,?,?)`, [user, edad, dni, corre, contrasena], (err, rows) => {
          if (err) {
            console.log(err)
          } else {
            /*Confirmacion*/
            const transporter = nodemailer.createTransport({
              service: 'outlook',
              port: 587,
              tls: {
                ciphers: "SSLv3",
                rejectUnauthorized: false,
              },
              auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PW,
              },
            });

            const mailOptions = {
              from: process.env.EMAIL,
              to: row.usuario,
              subject: '¡Bienvenido al sitio web!',
              html: '<h1>¡Hola!</h1><p>Le damos bienvenida a nuestro sitio web, espero tenga la mas comoda</p>' // html body
            };

            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });
          res.redirect("/cliente/login");
          }
        })
      }
    })
  }else{
    res.status(500).send('Verifica el captcha para continuar');
  }
});



router.get('/interfazclientes', (req, res) => {
  const query = "SELECT productos.*, clientes.*, ventas.total_pagado, ventas.cantidad FROM productos JOIN ventas ON productos.id = ventas.producto_id JOIN clientes ON clientes.id = ventas.cliente_id;"
  dbAdmin.all(query, (err, data) => {
    res.render('interfazclientes', {
      data_product: data
    });
  })

})

module.exports = router;
