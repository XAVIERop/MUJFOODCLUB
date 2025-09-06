import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Users, Store, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const StatsSection: React.FC = () => {
  const [cafeCount, setCafeCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch cafe count
        const { count: cafeCount, error: cafeError } = await supabase
          .from('cafes')
          .select('*', { count: 'exact', head: true });

        if (!cafeError && cafeCount !== null) {
          setCafeCount(cafeCount);
        }

        // Fetch student count (profiles count)
        const { count: studentCount, error: studentError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (!studentError && studentCount !== null) {
          setStudentCount(studentCount);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex flex-wrap gap-4 mb-8">
      <Badge variant="secondary" className="px-4 py-2 text-sm">
        <Store className="w-4 h-4 mr-2" />
        {cafeCount} Cafes
      </Badge>
      <Badge variant="secondary" className="px-4 py-2 text-sm">
        <Users className="w-4 h-4 mr-2" />
        {studentCount} Students
      </Badge>
      <Badge variant="secondary" className="px-4 py-2 text-sm">
        <Clock className="w-4 h-4 mr-2" />
        24/7 Available
      </Badge>
    </div>
  );
};

export default StatsSection;
