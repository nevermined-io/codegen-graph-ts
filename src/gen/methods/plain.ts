import { convertType } from "gen/util";
import { heading, multiBody, singleBody, types } from "../segments/body";
import { Entity, Field, Schema } from "../types";

/**
 * Writes a single file which contains types and async functions for every queryable entity.
 */
export default function plain(schema: Schema): string {

    const out: string[] = [];

    out.push(heading());

    const queryEntity = schema.types.filter(e => e.name === 'Query' && e.fields).pop()

    for (const entity of schema.types) {
        const filterEntity = schema.types.find(e => e.name === entity.name + '_filter');
        if (!filterEntity) continue;

        out.push(types(entity, filterEntity));

        const funcName = queryEntity?.fields?.find(f => f.type.name === entity.name)?.name
        const funcNames =  queryEntity?.fields?.find(f => f.type.ofType?.kind === 'LIST' && f.type.ofType.ofType?.ofType?.name === entity.name)?.name
        if(!funcName || !funcNames) {
            throw new TypeError(`Couldn't get query function names for ${entity.name}`)
        }

        out.push(`export const get${entity.name}ById = ${singleBody(entity, funcName)};`);
        out.push(`export const get${entity.name}s = ${multiBody(entity, funcNames)};`);
    }

    return out.join('\n');
}