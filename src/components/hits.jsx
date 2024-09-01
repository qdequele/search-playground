import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const Hits = ({ results }) => {
  return (
    <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
      {results && results.length > 0 && (
        <div className="w-full">
          {results.map((result, index) => (
            <Hit hit={result} />
          ))}
        </div>
      )}
    </div>
  );
};

const Hit = ({ hit }) => {
  return (
    <Card className="w-full mb-2">
      <CardContent className="p-4">
        <div className="flex">
          <div className="flex-shrink-0 mr-4 hidden xs:block">
            <img
              src={hit.image}
              alt={hit.name}
              className="w-24 h-24 object-cover rounded-lg "
            />
          </div>
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold line-clamp-1">
                {hit.name}
              </h3>
              { hit._rankingScore && (
              <Badge variant="secondary" className="ml-2">
                {hit._rankingScore.toFixed(2)}
                </Badge>
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
              {hit.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Hits;
