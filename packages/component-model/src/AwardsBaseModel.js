const BaseModel = require('@pubsweet/base-model');
const { NotFoundError } = require('@pubsweet/errors');

const parseEagerRelations = relations =>
    Array.isArray(relations) ? `[${relations.join(', ')}]` : relations;

class AwardsBaseModel extends BaseModel {

    static async find(id, eagerLoadRelations) {
        const object = await this.query()
            .findById(id)
            .skipUndefined()
            .eager(parseEagerRelations(eagerLoadRelations));

        if (!object) {
            throw new NotFoundError(
                `Object not found: ${this.name} with 'id' ${id}`,
            );
        }

        return object;
    }

    static async findOneByField(field, value, eagerLoadRelations) {
        const object = await this.query()
            .where(field, value)
            .limit(1)
            .eager(parseEagerRelations(eagerLoadRelations));

        if (!object.length) {
            return;
        }

        return object[0];
    }
}

module.exports = AwardsBaseModel;
