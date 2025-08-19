from rest_framework import serializers
from django.db.models import Count
from .models import Job, Application, SavedJob
from users.serializers import UserSerializer

class JobSerializer(serializers.ModelSerializer):
    posted_by = UserSerializer(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    has_applied = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    application_count = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ('posted_by', 'created_at', 'updated_at')

    def get_has_applied(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.applications.filter(applicant=request.user).exists()
        return False

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.saved_by_users.filter(user=request.user).exists()
        return False

    def get_application_count(self, obj):
        if hasattr(obj, 'applications_count'):
            return obj.applications_count
        return obj.applications.count()

    def validate_salary_min(self, value):
        if value and value < 0:
            raise serializers.ValidationError("Salary cannot be negative.")
        return value

    def validate_salary_max(self, value):
        salary_min = self.initial_data.get('salary_min')
        if value and salary_min and value < salary_min:
            raise serializers.ValidationError("Maximum salary must be greater than minimum salary.")
        return value

class JobCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ('posted_by', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['posted_by'] = self.context['request'].user
        return super().create(validated_data)

class ApplicationSerializer(serializers.ModelSerializer):
    applicant = UserSerializer(read_only=True)
    job = JobSerializer(read_only=True)
    job_id = serializers.PrimaryKeyRelatedField(
        queryset=Job.objects.all(),
        source='job',
        write_only=True
    )

    class Meta:
        model = Application
        fields = '__all__'
        read_only_fields = ('applicant', 'status', 'applied_at', 'updated_at')

    def create(self, validated_data):
        validated_data['applicant'] = self.context['request'].user
        application, created = Application.objects.get_or_create(
            job=validated_data['job'],
            applicant=validated_data['applicant'],
            defaults=validated_data
        )
        if not created:
            for attr, value in validated_data.items():
                setattr(application, attr, value)
            application.save()
        return application

class ApplicationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ('status', 'notes')

class SavedJobSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)
    job_id = serializers.PrimaryKeyRelatedField(
        queryset=Job.objects.all(),
        source='job',
        write_only=True
    )

    class Meta:
        model = SavedJob
        fields = ('id', 'job', 'job_id', 'created_at')
        read_only_fields = ('user', 'created_at')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        saved_job, _ = SavedJob.objects.get_or_create(
            job=validated_data['job'],
            user=validated_data['user']
        )
        return saved_job
