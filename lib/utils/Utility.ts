import { SchemaMetadata } from '../storage/types/SchemaMetadata';
import { APIPathDefinition, SwaggerAPIDefinition, TClassDef, TClassProps, TSchemaProp, TSwaggerSchema, TSwaggerSchemaDef } from '../typings';
import { PlatformTools } from '../platform/PlatformTools';
import { Defaults } from './Defaults';
import { ConfigMetadataStorage } from '../storage/ConfigMetadataStorage';
import { getConfigMetadataStorage } from '../globals';
import { APIDefinitionMetadata } from '../storage/types/APIDefinitionMetadata';

export class Utility {
    /**
     * Returns target Class properties
     * @param _class
     * @returns Target class properties
     */
    static configStore: ConfigMetadataStorage = getConfigMetadataStorage();

    static getClassProps(target: any, name?: string): TClassDef {
        const instance: typeof target = new target();
        const props: TClassProps = [];

        for (const prop of Object.keys(instance)) {
            props.push({ prop, type: typeof instance[prop] });
        }
        return <TClassDef>{ name: name || target.name, props: props.reverse() };
    }

    /**
     * Generate Swagger Schema Definition
     */
    static genSchemaDef(obj: TClassDef): TSwaggerSchema {
        let props: TSchemaProp = {};

        for (const prop of obj.props) {
            props = Object.assign({ [prop.prop]: { type: prop.type } }, props);
        }

        return <TSwaggerSchema>{
            [obj.name]: {
                type: 'object',
                properties: props,
            },
        };
    }

    /**
     * Extracts Swagger Schema Object from JSON
     * @param swagger JSON Document
     * @params schema: new swaggified schemas
     * @returns schema object
     */
    static updateSchema(swaggerDoc: Buffer, schema: TSwaggerSchemaDef): string {
        const parsed = JSON.parse(swaggerDoc.toString());
        parsed.swaggerDefinition.definitions = schema;
        return JSON.stringify(parsed, null, 2);
    }

    /**
     * Extracts Swagger Schema Object from JSON
     * @param swagger JSON Document
     * @params schema: new swaggified schemas
     * @returns schema object
     */
    static updateAPIDefinition(swaggerDoc: Buffer, apiDefinition: SwaggerAPIDefinition): string {
        const parsed = JSON.parse(swaggerDoc.toString());
        parsed.swaggerDefinition.paths = apiDefinition;
        return JSON.stringify(parsed, null, 2);
    }

    /**
     * Generates swagger file from schemas
     * @params schema
     * @returns Promise<void>
     */
    static async swaggify(schema: TSwaggerSchemaDef | SwaggerAPIDefinition, type: 'DEFINITION' | 'SCHEMA') {
        return new Promise<void>((ok, fail) => {
            const swaggerDoc: Buffer = PlatformTools.getFileContents(Utility.configStore.swaggerDefinitionFilePath);
            let definition: string = '';
            if (type === 'DEFINITION') definition = this.updateAPIDefinition(swaggerDoc, schema as SwaggerAPIDefinition);
            else if (type === 'SCHEMA') definition = this.updateSchema(swaggerDoc, schema as TSwaggerSchemaDef);

            PlatformTools.writeToFile(Utility.configStore.swaggerDefinitionFilePath, definition);
            ok();
        });
    }

    /**
     * Converts SchemaMetadata[] to plain JSON Object
     * @param array SchemaMetadata array
     * @returns JSON defined SwaggerSchema
     */
    static toSwaggerSchema(array: SchemaMetadata[]): TSwaggerSchemaDef {
        let definition: TSwaggerSchemaDef = <TSwaggerSchemaDef>{};
        for (const item of array) {
            definition = {
                ...definition,
                ...{ [item.name]: item.swaggerDefinition[item.name] },
            };
        }

        return definition;
    }

    /**
     * Converts APIDefinitionMetadata[] to plain JSON Object
     * @param array APIDefinitionMetadata array
     * @returns JSON defined SwaggerSchema
     */
    static toSwaggerAPIDefinition(array: APIDefinitionMetadata[]): SwaggerAPIDefinition {
        let apiDefinition: SwaggerAPIDefinition = <SwaggerAPIDefinition>{};
        for (const item of array) {
            apiDefinition = {
                ...apiDefinition,
                ...{
                    [item.apiDefinition.pathString]: {
                        [item.apiDefinition.method]: {
                            tags: item.apiDefinition.tags,
                            operationId: item.apiDefinition.meta.operationId,
                            summary: item.apiDefinition.meta.summary,
                            description: item.apiDefinition.meta.description,
                            parameters: item.apiDefinition.meta.parameters,
                            consumes: item.apiDefinition.meta.consumes,
                            produces: item.apiDefinition.meta.produces,
                        },
                    },
                },
            };
        }
        return apiDefinition;
    }
}