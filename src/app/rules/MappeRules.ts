import {IMappe, ISoknad} from 'app/models/types';

export class MappeRules {

    public static isMapperResponseValid(mapperResponse: IMappe[]): boolean {
        return mapperResponse.every(MappeRules.isMappeResponseValid);
    }

    public static isMappeResponseValid(mappeResponse: IMappe): boolean {
        return !!(!!mappeResponse.mappe_id &&
                  !!mappeResponse.personlig &&
                  Object.keys(mappeResponse.personlig).length > 0 &&
                  Object.keys(mappeResponse.personlig).every(key =>
                      !!mappeResponse.personlig![key]!.innhold &&
                      MappeRules.isSoknadResponseValid(mappeResponse.personlig![key].innhold)));
    }

    public static isSoknadResponseValid(soknad?: ISoknad): boolean {
        return !!soknad;
    }
}