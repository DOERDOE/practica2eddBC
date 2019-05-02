/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';
/**
 * Write your transction processor functions here
 */

/**
 * Track the trade of a commodity from one trader to another
 * @param {org.usac.tienda.Recargar} recargar - the trade to be processed
 * @transaction
 */
async function Recargar(recargar) {
    var factory = getFactory();
    var NS = 'org.usac.tienda';
    recargar.usuario.saldo += recargar.dinero;
    return getParticipantRegistry(NS + '.Usuario')
        .then(function(registroUsuarios){
            return registroUsuarios.update(recargar.usuario);
        })
}


/**
 * Track the trade of a commodity from one trader to another
 * @param {org.usac.tienda.Reabastecer} reabastecer - the trade to be processed
 * @transaction
 */
async function Reabastecer(reabastecer) {
    reabastecer.producto.cantidad += reabastecer.cantidad;
    let assetRegistry = await getAssetRegistry('org.usac.tienda.Producto');
    await assetRegistry.update(reabastecer.producto);
}

/**
 * Track the trade of a commodity from one trader to another
 * @param {org.usac.tienda.Pago} pago - the trade to be processed
 * @transaction
 */
async function Pago(pago) {
    if(pago.producto.cantidad==0){
        console.log("No se admiten compras de aire, no somos lay's");
    }else{
        console.log("No lleva 0 articulos");
        if(pago.producto.cantidad>0){
            console.log("Lleva mas de 0 articulos")
            if(pago.usuario.saldo < pago.producto.precio){
                console.log("usted no tiene pisto suficiente krnal");
            }else{
                pago.producto.cantidad = (pago.producto.cantidad - 1);
                if (pago.producto.oferta != 'Awevo') {
                    console.log("No lleva oferta el krnal");
                    var saldo = (pago.usuario.saldo - pago.producto.precio);
                    var ganancias = (pago.producto.sucursal.ganancias + pago.producto.precio);
                    pago.usuario.saldo = saldo;
                    pago.producto.sucursal.ganancias = ganancias;    
                } else if(pago.producto.oferta == 'Awevo'){
                    console.log("Pvta que oferton");
                    var saldo = (pago.usuario.saldo - (pago.producto.precio*0.6));
                    var ganancias = (pago.producto.sucursal.ganancias + (pago.producto.precio*0.6));
                    pago.usuario.saldo = saldo;
                    pago.producto.sucursal.ganancias = ganancias;
                }
                console.log("pago de un producto realizado con exito.");
                let parti2Registry = await getParticipantRegistry('org.usac.tienda.Sucursal');
                await parti2Registry.update(pago.producto.sucursal);
        
                let assetRegistry = await getAssetRegistry('org.usac.tienda.Producto');
                await assetRegistry.update(pago.producto);
        
                let partiRegistry = await getParticipantRegistry('org.usac.tienda.Usuario');
                await partiRegistry.update(pago.usuario);
        
            }
        }    
    }    
}