import React, { useReducer, useEffect } from "react"
import authContext from "./authContext"
import authReducer from "./authReducer"
import clienteAxios from "../../config/axios"
import {
  REGISTRO_EXITOSO,
  REGISTRO_ERROR,
  OBTENER_USUARIO,
  LOGIN_EXITOSO,
  LOGIN_ERROR,
  CERRAR_SESION,
} from "../../types"

import tokenAuth from "../../config/tokenAuth"

const AuthState = props => {
  /* const storageToken = () => {
    if (window !== "undefined") {
      initialState.token = localStorage.getItem("token")
      retrun
    }
    return " "
  } */

  useEffect(() => {
    initialState.token = localStorage.getItem("token")
  }, [])

  const initialState = {
    token: "",
    autenticado: null,
    usuario: null,
    mensaje: null,
    cargando: true,
  }

  const [state, dispath] = useReducer(authReducer, initialState)

  /* Funciones */

  const registrarUsuario = async datos => {
    try {
      const respuesta = await clienteAxios.post("/user/register", datos)
      console.log(respuesta.data)
      dispath({
        type: REGISTRO_EXITOSO,
        payload: respuesta.data,
      })

      /* Obtener el usuario */
      usuarioAutenticado(datos)
    } catch (error) {
      console.log(error)

      const alerta = {
        msg: error.response.data.msg,
        categoria: "alerta-error",
      }
      dispath({
        type: REGISTRO_ERROR,
        payload: alerta,
      })
    }
  }

  /* Retorna el usuario autenticado */
  const usuarioAutenticado = async () => {
    const token = localStorage.getItem("token")

    if (token) {
      /* TODO: Funcion para enviar el token por header */
      tokenAuth(token)
    }

    try {
      if (token) {
        const respuesta = await clienteAxios.post(`/user/login/${token}`)

        dispath({
          type: OBTENER_USUARIO,
          payload: respuesta.data,
        })
      }
    } catch (error) {
      console.log(error.response)
      dispath({
        type: LOGIN_ERROR,
      })
    }
  }

  /* cuando el susuario inicia sesion */
  const iniciarSesion = async datos => {
    try {
      const respuesta = await clienteAxios.post("/user/login", datos)

      dispath({ type: LOGIN_EXITOSO, payload: respuesta.data })

      console.log(respuesta)

      //Obtener el usuario
      usuarioAutenticado(datos)
    } catch (error) {
      console.log(error.response.data.message)

      const alerta = {
        msg: error.response.data.message,
        categoria: "alerta-error",
      }

      dispath({
        type: LOGIN_ERROR,
        payload: alerta,
      })
    }
  }

  /* cierra la sesion del usuario */
  const cerrarSesion = () => {
   
    location.reload()
    dispath({
      type: CERRAR_SESION,
    })
  }

  return (
    <authContext.Provider
      value={{
        token: state.token,
        autenticado: state.autenticado,
        usuario: state.usuario,
        mensaje: state.mensaje,
        cargando: state.cargando,
        registrarUsuario,
        iniciarSesion,
        usuarioAutenticado,
        cerrarSesion,
      }}
    >
      {props.children}
    </authContext.Provider>
  )
}

export default AuthState
