import { Pizza } from './pizza';
import { PizzaService } from './pizza.service';
import DbConnection from '../database/dbConfig';
import { Ingredient } from '../ingredient/ingredient';


export class PizzaJSONService implements PizzaService {
    constructor(private dbconnection: DbConnection) {
    }

    
    addPizza(pizza: Pizza, callback: (error: Error | null, result?: any) => void): void {
        if(pizza!== null && pizza !== undefined){
            const query = 'INSERT INTO pizza (name, price) VALUES (?, ?)';
            const values = [pizza.name, pizza.price];
            console.log('pizza : ', values);
            this.dbconnection.query(query, values, (error: Error | null, result: any) => {
                if (error) {
                    callback(error);
                    return;
                }
                callback(null, result);
            });
        }
    }

    addIngredientsToPizza(pizzaId: number, ingredientIds: number[]): Promise<any[]> {
        if (pizzaId && ingredientIds && ingredientIds.length > 0) {
            return new Promise<any[]>(async (resolve, reject) => {
                const query = 'INSERT INTO Pizza_Ingredient (pizzaId, ingredientId) VALUES (?, ?);';
                const results: any[] = [];
    
                try {
                    for (const id of ingredientIds) {
                        const values = [pizzaId, id];
                        console.log('pizza-ingredient : ', values);
                        const result = await this.dbconnection.query(query, values, (error: Error | null, result: any) => {});
                        results.push(result);
                    }
                    resolve(results);
                } catch (error: any) {
                    reject(new Error('Erreur lors de l\'ajout des ingrédients à la pizza: ' + error.message));
                }
            });
        } else {
            return Promise.reject(new Error('Données manquantes pour ajouter des ingrédients à la pizza.'));
        }
    }

    getAllPizzas(callback: (error: Error | null, pizzas?: Pizza[]) => void): void {
        let dbPizzas: Pizza[] = [];
    
        this.dbconnection.query('SELECT id FROM pizza', [], async (queryError: Error | null, results: any) => {
            if (queryError) {
                callback(queryError);
                return;
            }
            let ids: [{'id': number}] = results;
            try {
                for (const id of ids) {
                    const dbPizza: Pizza = await this.getPizzaById(id.id);
                    dbPizzas.push(dbPizza);
                }
                console.log("finished : ", dbPizzas);
    
                callback(null, dbPizzas);
            } catch (error:any) {
                callback(error);
            } 
        });
    }

    async getPizzaById(id: number): Promise<Pizza> {
        return new Promise((resolve, reject) => {
            let query = 'select pizza.id, pizza.name, pizza.price, ingredient.id as ingredientId, ingredient.name as ingredientName '+
            'from pizza_ingredient inner join pizza on pizza.id = pizza_ingredient.pizzaId inner join ingredient on ingredient.id = pizza_ingredient.ingredientId where pizza.id = ?';
            this.dbconnection.query(query, [id], (error: Error | null, result: any) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (result.length === 0) {
                    return;
                }
                const user = result[0];
                let ingredients: Ingredient[] = [];
                for (const ing of result) {
                    ingredients.push({
                        'id' : ing.ingredientId,
                        'name' : ing.ingredientName
                    })
                }
                const pizza: Pizza = {
                    'id' : result[0].id,
                    'name' : result[0].name,
                    'price' : result[0].price,
                    'ingredients' : ingredients
                }
                resolve(pizza);
            });
        });
    }

    deletePizza(id: number, callback: (error: Error | null, result?: any) => void): void{
        const query = 'DELETE FROM pizza WHERE id = ?';
        this.dbconnection.query(query, [id], (error: Error | null, result: any) => {
        if (error) {
            callback(error);
            return;
        }
        callback(null, result);
        });
        
        // throw new Error('3.Method not implemented.');
    }

    updateById(id: number, updatedData: any, callback: (error: Error | null, result?: any) => void): void{
        console.log("udpateData : ", updatedData);
        const query = 'UPDATE pizza SET ? WHERE id = ?';
        this.dbconnection.query(query, [updatedData, id], (error: Error | null, result: any) => {
          if (error) {
            callback(error);
            return;
          }
          callback(null, result);
        });
    }

    //   rajouter une fonction qui permet de deconnecter de la base : 
    // decoDB():void {
    //     this.dbconnection.close((closeError: Error | null) => {
    //         if (closeError) {
    //             console.error('Erreur lors de la fermeture de la connexion :', closeError);
    //         }
    //     });
    // }
}
