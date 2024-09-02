import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const Hits = ({ results, config, panelNumber }) => {
  return (
    <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
      {results && results.length > 0 && (
        <div className="w-full">
          {results.map((result, index) => (
            <Hit key={index} hit={result} config={config} panelNumber={panelNumber} />
          ))}
        </div>
      )}
    </div>
  );
};

const Hit = ({ hit, config, panelNumber }) => {
  const handleStarClick = () => {
    const data = {
      hit,
      config,
      panelNumber,
    };
    // Replace with your third-party API call
    console.log("Star clicked:", data);
  };

  return (
    <Card className="w-full mb-2 relative group">
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
              {hit._rankingScore && (
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
      <button
        onClick={handleStarClick}
        className="absolute bottom-2 right-4 text-yellow-500 hidden group-hover:block"
        aria-label="Star"
      >
        <Star className="h-4 w-4" />
      </button>
    </Card>
  );
};

export default Hits;
