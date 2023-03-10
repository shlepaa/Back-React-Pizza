import { Response, Request, NextFunction } from 'express';
import { ObjectId } from 'mongodb';
import getAllTypes from '../../helpers/getAllTypes';
import DeletedPizzaResponse from '../../interfaces/DeletedPizzaResponse';
import { ParamsWithId } from '../../interfaces/ParamsWithId';
import PizzasAndTypes from '../../interfaces/PizzasAndTypes';
import { Pizza, Pizzas, PizzaWithId } from './pizzas.model';

class PizzaHandler {
	public static async getAll(
		_req: Request,
		res: Response<PizzasAndTypes>,
		next: NextFunction
	): Promise<void> {
		try {
			const pizzas = await Pizzas.find().toArray();

			const result = {
				pizzas,
				types: await getAllTypes(),
			};
			res.json(result);
		} catch (error) {
			next(error);
		}
	}

	public static async getOne(
		req: Request<ParamsWithId, PizzaWithId, {}>,
		res: Response<PizzaWithId>,
		next: NextFunction
	): Promise<void> {
		try {
			const result = await Pizzas.findOne({
				_id: new ObjectId(req.params.id),
			});
			if (!result) {
				res.status(404);
				throw new Error(`Pizzas with id ${req.params.id} not found`);
			}
			res.json(result);
		} catch (error) {
			next(error);
		}
	}

	public static async createOne(
		req: Request<{}, PizzaWithId, Pizza>,
		res: Response<PizzaWithId>,
		next: NextFunction
	): Promise<void> {
		try {
			const result = await Pizzas.insertOne(req.body);
			if (!result.insertedId) {
				throw new Error('Error inserting pizza');
			}
			res.status(201);
			res.json({
				...req.body,
				_id: result.insertedId,
			});
		} catch (error) {
			next(error);
		}
	}

	public static async updateOne(
		req: Request<ParamsWithId, PizzaWithId, PizzaWithId>,
		res: Response<PizzaWithId>,
		next: NextFunction
	): Promise<void> {
		try {
			const result = await Pizzas.findOneAndUpdate(
				{
					_id: new ObjectId(req.params.id),
				},
				{
					$set: req.body,
				},
				{
					returnDocument: 'after',
				}
			);
			if (!result.value) {
				res.status(404);
				throw new Error(`Pizza with id ${req.params.id} not found`);
			}
			res.status(201);
			res.json(result.value);
		} catch (error) {
			next(error);
		}
	}

	public static async deleteOne(
		req: Request<ParamsWithId, DeletedPizzaResponse, {}>,
		res: Response<DeletedPizzaResponse>,
		next: NextFunction
	): Promise<void> {
		try {
			const result = await Pizzas.findOneAndDelete({
				_id: new ObjectId(req.params.id),
			});
			if (!result.value) {
				res.status(404);
				throw new Error(
					`Pizza with id ${req.params.id} not found or already deleted`
				);
			}
			res.json({
				message: 'Pizza successfully has deleted',
				id: req.params.id,
			});
		} catch (error) {
			next(error);
		}
	}
}

export default PizzaHandler;
