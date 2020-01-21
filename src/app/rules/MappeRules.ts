import {IMappe, ISoknad} from 'app/models/types';

export class MappeRules {

    public static isMapperResponseValid(mapperResponse: IMappe[]): boolean {
        return mapperResponse.every(MappeRules.isMappeResponseValid);
    }

    public static isMappeResponseValid(mappeResponse: IMappe): boolean {
        return !!(!!mappeResponse.mappeId &&
                  !!mappeResponse.personer &&
                  Object.keys(mappeResponse.personer).length > 0 &&
                  Object.keys(mappeResponse.personer).every(key =>
                  !!mappeResponse.personer![key]!.soeknad &&
                  MappeRules.isSoknadResponseValid(mappeResponse.personer![key].soeknad)));
    }

    public static isSoknadResponseValid(soknad?: ISoknad): boolean {
        return !!soknad;
    }
}