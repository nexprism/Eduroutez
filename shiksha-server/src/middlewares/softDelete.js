import softDelete from 'mongoose-softdelete';

export const applySoftDelete = (schema) => {
    schema.plugin(softDelete, { deletedAt: null, deleted: true });
    };

